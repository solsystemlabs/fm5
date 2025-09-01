import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "./logger";

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
  const nodeEnv = process.env.NODE_ENV || "development";
  const environment =
    nodeEnv === "development"
      ? "dev"
      : nodeEnv === "production"
        ? "prod"
        : nodeEnv;

  const config = {
    projectName: process.env.PROJECT_NAME || "fm5-manager",
    environment,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
    region: process.env.AWS_REGION || "us-east-1",
    baseUrl: process.env.AWS_S3_BASE_URL,
  };

  // Validate required configuration
  if (!config.bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is required");
  }

  return config;
}

/**
 * Sanitize filename to prevent path traversal and ensure S3 compatibility
 */
export function sanitizeFilename(filename: string): string {
  return (
    filename
      // Remove path separators and dangerous characters
      .replace(/[/\\:*?"<>|]/g, "-")
      // Remove leading/trailing dots and spaces
      .replace(/^[.\s]+|[.\s]+$/g, "")
      // Replace multiple dashes with single dash
      .replace(/-+/g, "-")
      // Ensure it's not empty and has reasonable length
      .substring(0, 100) || "unnamed-file"
  );
}

export function generateS3Key(modelId: number, filename: string): string {
  const config = getS3Config();
  const sanitizedFilename = sanitizeFilename(filename);

  const s3Key = `${config.projectName}/${config.environment}/slicedFiles/model-${modelId}/${sanitizedFilename}`;

  logger.info("Generated S3 key", {
    modelId,
    originalFilename: filename,
    sanitizedFilename,
    s3Key,
    environment: config.environment,
  });

  return s3Key;
}

export function generateModelFileS3Key(
  modelId: number,
  filename: string,
): string {
  const config = getS3Config();
  const sanitizedFilename = sanitizeFilename(filename);

  const s3Key = `${config.projectName}/${config.environment}/modelFiles/model-${modelId}/${sanitizedFilename}`;

  logger.info("Generated model file S3 key", {
    modelId,
    originalFilename: filename,
    sanitizedFilename,
    s3Key,
    environment: config.environment,
  });

  return s3Key;
}

export function generateModelImageS3Key(
  modelId: number,
  filename: string,
): string {
  const config = getS3Config();
  const sanitizedFilename = sanitizeFilename(filename);

  const s3Key = `${config.projectName}/${config.environment}/imageFiles/model-${modelId}/${sanitizedFilename}`;

  logger.info("Generated model image S3 key", {
    modelId,
    originalFilename: filename,
    sanitizedFilename,
    s3Key,
    environment: config.environment,
  });

  return s3Key;
}

export function generateThreeMFFileS3Key(
  modelId: number,
  filename: string,
): string {
  const config = getS3Config();
  const sanitizedFilename = sanitizeFilename(filename);

  const s3Key = `${config.projectName}/${config.environment}/threeMFFiles/model-${modelId}/${sanitizedFilename}`;

  logger.info("Generated 3MF file S3 key", {
    modelId,
    originalFilename: filename,
    sanitizedFilename,
    s3Key,
    environment: config.environment,
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

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StreamingUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  partSize?: number; // Size in bytes, defaults to 5MB
  maxConcurrentParts?: number; // Max concurrent uploads, defaults to 3
}

export async function uploadFileToS3(
  file: File | Buffer,
  s3Key: string,
  contentType: string = "application/octet-stream",
): Promise<UploadResult> {
  const config = getS3Config();

  try {
    logger.info("Starting S3 upload", {
      s3Key,
      contentType,
      bucket: config.bucketName,
      size: file instanceof File ? file.size : file.length,
    });

    const fileBuffer =
      file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      // Add metadata for better file management
      Metadata: {
        "uploaded-by": "fm5-manager",
        "upload-timestamp": new Date().toISOString(),
        environment: config.environment,
      },
      // Server-side encryption (optional but recommended)
      ServerSideEncryption: "AES256",
    });

    await s3Client.send(command);

    // Generate S3 URL (direct S3 URL, not CloudFront)
    const s3Url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${s3Key}`;

    const result: UploadResult = {
      s3Key,
      s3Url,
      size: fileBuffer.length,
    };

    logger.info("S3 upload successful", result);
    return result;
  } catch (error) {
    logger.error("S3 upload failed", {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generate signed URL for secure downloads
 */
export async function generateSignedDownloadUrl(
  s3Key: string,
  expirationSeconds: number = 3600, // 1 hour default
): Promise<string> {
  const config = getS3Config();

  try {
    logger.info("Generating signed download URL", {
      s3Key,
      bucket: config.bucketName,
      expirationSeconds,
    });

    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    logger.info("Signed URL generated successfully", {
      s3Key,
      expirationSeconds,
    });

    return signedUrl;
  } catch (error) {
    logger.error("Failed to generate signed URL", {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw new Error(
      `Failed to generate signed download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(s3Key: string): Promise<void> {
  const config = getS3Config();

  try {
    logger.info("Deleting file from S3", {
      s3Key,
      bucket: config.bucketName,
    });

    const command = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
    });

    await s3Client.send(command);

    logger.info("S3 file deleted successfully", { s3Key });
  } catch (error) {
    logger.error("Failed to delete S3 file", {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw new Error(
      `Failed to delete file from S3: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Upload 3MF file with automatic content type detection and key generation
 * Automatically uses multipart upload for large files (>5MB)
 */
export async function upload3MFFile(
  file: File,
  modelId: number,
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  // Validate file type
  if (!file.name.endsWith(".3mf") && !file.name.endsWith(".gcode.3mf")) {
    throw new Error("Only 3MF files are supported (.3mf or .gcode.3mf)");
  }

  // Generate S3 key
  const s3Key = generateThreeMFFileS3Key(modelId, file.name);

  // Set appropriate content type for 3MF files
  const contentType = "application/vnd.ms-3mfdocument";

  logger.info("Starting 3MF file upload", {
    filename: file.name,
    size: file.size,
    modelId,
    s3Key,
    contentType,
    useMultipart: file.size > (options.partSize || 5 * 1024 * 1024),
  });

  // Use smart upload that chooses method based on file size
  return await uploadWithProgress(file, s3Key, contentType, options);
}

/**
 * Check if S3 configuration is valid
 */
export function validateS3Config(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errors.push("AWS_ACCESS_KEY_ID environment variable is required");
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errors.push("AWS_SECRET_ACCESS_KEY environment variable is required");
  }

  if (!process.env.AWS_S3_BUCKET_NAME) {
    errors.push("AWS_S3_BUCKET_NAME environment variable is required");
  }

  if (!process.env.AWS_REGION) {
    errors.push("AWS_REGION environment variable is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Advanced streaming upload with multipart support for large files
 */
export async function uploadLargeFileToS3(
  file: File,
  s3Key: string,
  contentType?: string,
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  const config = getS3Config();
  const {
    partSize = 5 * 1024 * 1024,
    maxConcurrentParts = 3,
    onProgress,
  } = options; // 5MB default part size

  // For files smaller than partSize, use regular upload
  if (file.size <= partSize) {
    return uploadFileToS3(file, s3Key, contentType);
  }

  logger.info("Starting multipart upload", {
    filename: file.name,
    size: file.size,
    s3Key,
    partSize,
    totalParts: Math.ceil(file.size / partSize),
  });

  let uploadId: string | undefined;

  try {
    // Step 1: Initiate multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: config.bucketName,
      Key: s3Key,
      ContentType: contentType || "application/octet-stream",
      Metadata: {
        originalFileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    const createResponse = await s3Client.send(createCommand);
    uploadId = createResponse.UploadId!;

    logger.info("Multipart upload initiated", { uploadId, s3Key });

    // Step 2: Upload parts concurrently
    const parts: { ETag: string; PartNumber: number }[] = [];
    const totalParts = Math.ceil(file.size / partSize);
    let uploadedBytes = 0;

    // Create semaphore for concurrent uploads
    const semaphore = new Array(maxConcurrentParts).fill(null);
    const uploadPromises: Promise<void>[] = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const partData = file.slice(start, end);

      const uploadPromise = (async () => {
        // Wait for available slot
        await new Promise<void>((resolve) => {
          const checkSlot = () => {
            const availableIndex = semaphore.findIndex((slot) => slot === null);
            if (availableIndex !== -1) {
              semaphore[availableIndex] = partNumber;
              resolve();
            } else {
              setTimeout(checkSlot, 10);
            }
          };
          checkSlot();
        });

        try {
          logger.debug("Uploading part", { partNumber, size: partData.size });

          const partCommand = new UploadPartCommand({
            Bucket: config.bucketName,
            Key: s3Key,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: new Uint8Array(await partData.arrayBuffer()),
          });

          const partResponse = await s3Client.send(partCommand);

          parts[partNumber - 1] = {
            ETag: partResponse.ETag!,
            PartNumber: partNumber,
          };

          uploadedBytes += partData.size;

          // Report progress
          if (onProgress) {
            onProgress({
              loaded: uploadedBytes,
              total: file.size,
              percentage: Math.round((uploadedBytes / file.size) * 100),
            });
          }

          logger.debug("Part uploaded successfully", {
            partNumber,
            etag: partResponse.ETag,
            progress: `${uploadedBytes}/${file.size} bytes`,
          });
        } finally {
          // Release semaphore slot
          const slotIndex = semaphore.findIndex((slot) => slot === partNumber);
          if (slotIndex !== -1) {
            semaphore[slotIndex] = null;
          }
        }
      })();

      uploadPromises.push(uploadPromise);
    }

    // Wait for all parts to complete
    await Promise.all(uploadPromises);

    // Step 3: Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: config.bucketName,
      Key: s3Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });

    const completeResponse = await s3Client.send(completeCommand);

    const s3Url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${s3Key}`;

    logger.info("Multipart upload completed successfully", {
      s3Key,
      location: completeResponse.Location,
      etag: completeResponse.ETag,
      totalParts,
      fileSize: file.size,
    });

    return {
      s3Key,
      s3Url,
      size: file.size,
    };
  } catch (error) {
    // Abort multipart upload on error
    if (uploadId) {
      try {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: config.bucketName,
          Key: s3Key,
          UploadId: uploadId,
        });
        await s3Client.send(abortCommand);
        logger.info("Multipart upload aborted due to error", {
          uploadId,
          s3Key,
        });
      } catch (abortError) {
        logger.error("Failed to abort multipart upload", {
          uploadId,
          s3Key,
          errorMessage:
            abortError instanceof Error ? abortError.message : "Unknown error",
        });
      }
    }

    logger.error("Multipart upload failed", {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    throw new Error(
      `Failed to upload large file to S3: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Smart upload function that chooses the appropriate upload method based on file size
 */
export async function uploadWithProgress(
  file: File,
  s3Key: string,
  contentType?: string,
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  const { partSize = 5 * 1024 * 1024 } = options;

  // Use multipart upload for files larger than partSize
  if (file.size > partSize) {
    return uploadLargeFileToS3(file, s3Key, contentType, options);
  } else {
    // For smaller files, use simple upload
    const result = await uploadFileToS3(file, s3Key, contentType);

    // Simulate progress for consistency
    if (options.onProgress) {
      options.onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100,
      });
    }

    return result;
  }
}

/**
 * Upload model file with automatic content type detection and key generation
 * Supports STL, 3MF, and GCODE files
 */
export async function uploadModelFile(
  file: File,
  modelId: number,
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  // Validate file type
  const supportedExtensions = [".stl", ".3mf", ".gcode", ".gcode.3mf"];
  const hasValidExtension = supportedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  if (!hasValidExtension) {
    throw new Error(
      `Unsupported model file type. Supported: ${supportedExtensions.join(", ")}`,
    );
  }

  // Generate S3 key
  const s3Key = generateModelFileS3Key(modelId, file.name);

  // Set appropriate content type
  let contentType = "application/octet-stream";
  if (file.name.toLowerCase().endsWith(".stl")) {
    contentType = "model/stl";
  } else if (file.name.toLowerCase().endsWith(".3mf")) {
    contentType = "application/vnd.ms-3mfdocument";
  } else if (file.name.toLowerCase().endsWith(".gcode")) {
    contentType = "text/plain";
  }

  logger.info("Starting model file upload", {
    filename: file.name,
    size: file.size,
    modelId,
    s3Key,
    contentType,
  });

  return await uploadWithProgress(file, s3Key, contentType, options);
}

/**
 * Upload image file to S3 with public read access
 * Images need to be publicly accessible for display in the UI
 */
export async function uploadImageWithPublicAccess(
  file: File,
  s3Key: string,
  contentType: string = "image/jpeg",
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  const config = getS3Config();

  try {
    logger.info("Starting S3 image upload with public access", {
      s3Key,
      contentType,
      bucket: config.bucketName,
      size: file.size,
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      // Add metadata for better file management
      Metadata: {
        "uploaded-by": "fm5-manager",
        "upload-timestamp": new Date().toISOString(),
        environment: config.environment,
        "file-type": "image",
      },
      // Server-side encryption (optional but recommended)
      ServerSideEncryption: "AES256",
    });

    await s3Client.send(command);

    // Generate direct S3 URL (publicly accessible)
    const s3Url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${s3Key}`;

    const result: UploadResult = {
      s3Key,
      s3Url,
      size: fileBuffer.length,
    };

    logger.info("S3 image upload successful (public)", result);
    return result;
  } catch (error) {
    logger.error("S3 image upload failed", {
      s3Key,
      bucket: config.bucketName,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(
      `Failed to upload image to S3: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Upload model image with automatic content type detection and key generation
 * Supports PNG, JPG, and JPEG files
 */
export async function uploadModelImage(
  file: File,
  modelId: number,
  options: StreamingUploadOptions = {},
): Promise<UploadResult> {
  // Validate file type
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg"];
  const supportedExtensions = [".png", ".jpg", ".jpeg"];

  const hasValidType = supportedTypes.includes(file.type.toLowerCase());
  const hasValidExtension = supportedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  );

  if (!hasValidType && !hasValidExtension) {
    throw new Error(`Unsupported image file type. Supported: PNG, JPG, JPEG`);
  }

  // Generate S3 key
  const s3Key = generateModelImageS3Key(modelId, file.name);

  // Use the file's mime type or default to appropriate image type
  let contentType = file.type || "image/jpeg";
  if (file.name.toLowerCase().endsWith(".png")) {
    contentType = "image/png";
  }

  logger.info("Starting model image upload", {
    filename: file.name,
    size: file.size,
    modelId,
    s3Key,
    contentType,
  });

  // Use special upload function for images that sets public-read ACL
  return await uploadImageWithPublicAccess(file, s3Key, contentType, options);
}

/**
 * Upload multiple model files and images
 * Returns separate results for each file type
 */
export interface BatchUploadResult {
  modelFiles: Array<UploadResult & { filename: string; error?: string }>;
  images: Array<UploadResult & { filename: string; error?: string }>;
  threeMFFiles: Array<UploadResult & { filename: string; error?: string }>;
}

export async function uploadModelFilesAndImages(
  modelFiles: File[],
  images: File[],
  threeMFFiles: File[] = [],
  modelId: number,
  options: StreamingUploadOptions = {},
): Promise<BatchUploadResult> {
  const result: BatchUploadResult = {
    modelFiles: [],
    images: [],
    threeMFFiles: [],
  };

  // Upload model files
  for (const file of modelFiles) {
    try {
      const uploadResult = await uploadModelFile(file, modelId, options);
      result.modelFiles.push({ ...uploadResult, filename: file.name });
    } catch (error) {
      logger.error("Failed to upload model file", {
        filename: file.name,
        modelId,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
      });
      result.modelFiles.push({
        s3Key: "",
        s3Url: "",
        size: file.size,
        filename: file.name,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  // Upload images
  for (const file of images) {
    try {
      const uploadResult = await uploadModelImage(file, modelId, options);
      result.images.push({ ...uploadResult, filename: file.name });
    } catch (error) {
      logger.error("Failed to upload model image", {
        filename: file.name,
        modelId,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
      });
      result.images.push({
        s3Key: "",
        s3Url: "",
        size: file.size,
        filename: file.name,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  // Upload 3MF files
  for (const file of threeMFFiles) {
    try {
      const uploadResult = await upload3MFFile(file, modelId, options);
      result.threeMFFiles.push({ ...uploadResult, filename: file.name });
    } catch (error) {
      logger.error("Failed to upload 3MF file", {
        filename: file.name,
        modelId,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
      });
      result.threeMFFiles.push({
        s3Key: "",
        s3Url: "",
        size: file.size,
        filename: file.name,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  return result;
}

