import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

/**
 * S3 Service for FM5 Manager file storage
 * Handles 3MF file uploads, downloads, and management using hierarchical storage
 */

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * S3 configuration from environment variables
 */
export interface S3Config {
  projectName: string;
  environment: string;
  bucketName: string;
  region: string;
  baseUrl?: string;
}

/**
 * Get S3 configuration from environment variables
 */
export function getS3Config(): S3Config {
  // Normalize environment name for S3 key structure
  const nodeEnv = process.env.NODE_ENV || 'development';
  const environment = nodeEnv === 'development' ? 'dev' : nodeEnv === 'production' ? 'prod' : nodeEnv;
  
  const config = {
    projectName: process.env.PROJECT_NAME || 'fm5-manager',
    environment,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    region: process.env.AWS_REGION || 'us-east-1',
    baseUrl: process.env.AWS_S3_BASE_URL,
  };

  // Validate required configuration
  if (!config.bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
  }

  return config;
}

/**
 * Sanitize filename to prevent path traversal and ensure S3 compatibility
 */
export function sanitizeFilename(filename: string): string {
  return filename
    // Remove path separators and dangerous characters
    .replace(/[/\\:*?"<>|]/g, '-')
    // Remove leading/trailing dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Replace multiple dashes with single dash
    .replace(/-+/g, '-')
    // Ensure it's not empty and has reasonable length
    .substring(0, 100)
    || 'unnamed-file';
}

/**
 * Generate S3 key following the hierarchy: {PROJECT_NAME}/slicedFiles/{ENVIRONMENT}/model-{MODEL_ID}/{filename}
 */
export function generateS3Key(modelId: number, filename: string): string {
  const config = getS3Config();
  const sanitizedFilename = sanitizeFilename(filename);
  
  const s3Key = `${config.projectName}/slicedFiles/${config.environment}/model-${modelId}/${sanitizedFilename}`;
  
  logger.info('Generated S3 key', {
    modelId,
    originalFilename: filename,
    sanitizedFilename,
    s3Key,
    environment: config.environment
  });
  
  return s3Key;
}

/**
 * Upload file to S3
 */
export interface UploadResult {
  s3Key: string;
  s3Url: string;
  size: number;
}

export async function uploadFileToS3(
  file: File | Buffer, 
  s3Key: string,
  contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
  const config = getS3Config();
  
  try {
    logger.info('Starting S3 upload', {
      s3Key,
      contentType,
      bucket: config.bucketName,
      size: file instanceof File ? file.size : file.length
    });

    const fileBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
    
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      // Add metadata for better file management
      Metadata: {
        'uploaded-by': 'fm5-manager',
        'upload-timestamp': new Date().toISOString(),
        'environment': config.environment,
      },
      // Server-side encryption (optional but recommended)
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    // Generate S3 URL
    const s3Url = config.baseUrl 
      ? `${config.baseUrl}/${s3Key}`
      : `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${s3Key}`;

    const result: UploadResult = {
      s3Key,
      s3Url,
      size: fileBuffer.length,
    };

    logger.info('S3 upload successful', result);
    return result;

  } catch (error) {
    logger.error('S3 upload failed', {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate signed URL for secure downloads
 */
export async function generateSignedDownloadUrl(
  s3Key: string,
  expirationSeconds: number = 3600 // 1 hour default
): Promise<string> {
  const config = getS3Config();
  
  try {
    logger.info('Generating signed download URL', {
      s3Key,
      bucket: config.bucketName,
      expirationSeconds
    });

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    logger.info('Signed URL generated successfully', {
      s3Key,
      expirationSeconds
    });

    return signedUrl;

  } catch (error) {
    logger.error('Failed to generate signed URL', {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    throw new Error(`Failed to generate signed download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(s3Key: string): Promise<void> {
  const config = getS3Config();
  
  try {
    logger.info('Deleting file from S3', {
      s3Key,
      bucket: config.bucketName
    });

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
    });

    await s3Client.send(command);

    logger.info('S3 file deleted successfully', { s3Key });

  } catch (error) {
    logger.error('Failed to delete S3 file', {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload 3MF file with automatic content type detection and key generation
 */
export async function upload3MFFile(
  file: File,
  modelId: number
): Promise<UploadResult> {
  // Validate file type
  if (!file.name.endsWith('.3mf') && !file.name.endsWith('.gcode.3mf')) {
    throw new Error('Only 3MF files are supported (.3mf or .gcode.3mf)');
  }

  // Generate S3 key
  const s3Key = generateS3Key(modelId, file.name);
  
  // Set appropriate content type for 3MF files
  const contentType = 'application/vnd.ms-3mfdocument';
  
  logger.info('Starting 3MF file upload', {
    filename: file.name,
    size: file.size,
    modelId,
    s3Key,
    contentType
  });

  return await uploadFileToS3(file, s3Key, contentType);
}

/**
 * Check if S3 configuration is valid
 */
export function validateS3Config(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push('AWS_ACCESS_KEY_ID environment variable is required');
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push('AWS_SECRET_ACCESS_KEY environment variable is required');
  }

  if (!process.env.AWS_S3_BUCKET_NAME) {
    errors.push('AWS_S3_BUCKET_NAME environment variable is required');
  }

  if (!process.env.AWS_REGION) {
    errors.push('AWS_REGION environment variable is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}