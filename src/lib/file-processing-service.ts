import JSZip from 'jszip';
import { logger } from './logger';

/**
 * File Processing Service for FM5 Manager
 * Handles ZIP extraction, file categorization, and processing for model uploads
 */

export interface ProcessedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface ProcessedImageFile extends ProcessedFile {
  preview: string; // blob URL for preview
  category: 'thumbnail' | 'preview' | 'other';
}

export interface ProcessedModelFile extends ProcessedFile {
  fileType: 'stl' | '3mf' | 'gcode' | 'other';
}

export interface ProcessedFiles {
  images: ProcessedImageFile[];
  modelFiles: ProcessedModelFile[];
  totalSize: number;
  extractedCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Supported file types and their configurations
 */
export const SUPPORTED_FILE_TYPES = {
  images: {
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  modelFiles: {
    extensions: ['.stl', '.3mf', '.gcode', '.gcode.3mf', '.obj'],
    mimeTypes: ['model/stl', 'application/vnd.ms-3mfdocument', 'text/plain', 'application/octet-stream'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  archives: {
    extensions: ['.zip'],
    mimeTypes: ['application/zip', 'application/x-zip-compressed'],
    maxSize: 500 * 1024 * 1024, // 500MB
  }
};

/**
 * Image file patterns for categorization
 */
const IMAGE_PATTERNS = {
  thumbnail: /^(plate_\d+(?:_small)?\.png|thumbnail\.(?:png|jpg|jpeg))$/i,
  preview: /^(top_\d+|pick_\d+|plate_no_light_\d+|preview\d*)\.(?:png|jpg|jpeg)$/i,
};

/**
 * Validate file types and sizes
 */
export function validateFiles(files: File[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const file of files) {
    // Check file size (overall limit)
    const maxFileSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxFileSize) {
      result.errors.push(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 500MB.`);
      continue;
    }

    // Check if file type is supported
    const isImage = isImageFile(file);
    const isModel = isModelFile(file);
    const isArchive = isArchiveFile(file);

    if (!isImage && !isModel && !isArchive) {
      result.errors.push(`File "${file.name}" has unsupported type. Supported: images, model files, and ZIP archives.`);
    }

    // Specific size checks
    if (isImage && file.size > SUPPORTED_FILE_TYPES.images.maxSize) {
      result.errors.push(`Image "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size for images is 10MB.`);
    }

    if (isModel && file.size > SUPPORTED_FILE_TYPES.modelFiles.maxSize) {
      result.errors.push(`Model file "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size for model files is 100MB.`);
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  
  return SUPPORTED_FILE_TYPES.images.extensions.includes(extension) ||
         SUPPORTED_FILE_TYPES.images.mimeTypes.includes(mimeType);
}

/**
 * Check if file is a model file
 */
export function isModelFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  
  return SUPPORTED_FILE_TYPES.modelFiles.extensions.includes(extension) ||
         SUPPORTED_FILE_TYPES.modelFiles.mimeTypes.includes(mimeType);
}

/**
 * Check if file is an archive
 */
export function isArchiveFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();
  
  return SUPPORTED_FILE_TYPES.archives.extensions.includes(extension) ||
         SUPPORTED_FILE_TYPES.archives.mimeTypes.includes(mimeType);
}

/**
 * Get file extension (with dot)
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Categorize image by filename patterns
 */
function categorizeImage(filename: string): 'thumbnail' | 'preview' | 'other' {
  if (IMAGE_PATTERNS.thumbnail.test(filename)) {
    return 'thumbnail';
  }
  if (IMAGE_PATTERNS.preview.test(filename)) {
    return 'preview';
  }
  return 'other';
}

/**
 * Determine model file type
 */
function getModelFileType(filename: string): 'stl' | '3mf' | 'gcode' | 'other' {
  const extension = getFileExtension(filename);
  
  if (extension === '.stl') return 'stl';
  if (extension === '.3mf' || filename.toLowerCase().endsWith('.gcode.3mf')) return '3mf';
  if (extension === '.gcode') return 'gcode';
  return 'other';
}

/**
 * Create blob URL for image preview
 */
export async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      resolve(URL.createObjectURL(blob));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract and process ZIP archive
 */
export async function extractZipFiles(zipFile: File): Promise<ProcessedFiles> {
  logger.info('Starting ZIP extraction', {
    filename: zipFile.name,
    size: zipFile.size
  });

  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile);
    
    const result: ProcessedFiles = {
      images: [],
      modelFiles: [],
      totalSize: 0,
      extractedCount: 0
    };

    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and system files
      if (zipEntry.dir || filename.startsWith('__MACOSX/') || filename.startsWith('.DS_Store')) {
        continue;
      }

      try {
        const fileData = await zipEntry.async('arraybuffer');
        const extractedFile = new File([fileData], filename, {
          type: getMimeTypeFromFilename(filename)
        });

        result.totalSize += extractedFile.size;
        result.extractedCount++;

        // Process based on file type
        if (isImageFile(extractedFile)) {
          const preview = await createImagePreview(extractedFile);
          const processedImage: ProcessedImageFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            preview,
            category: categorizeImage(filename)
          };
          result.images.push(processedImage);
        } else if (isModelFile(extractedFile)) {
          const processedModel: ProcessedModelFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            fileType: getModelFileType(filename)
          };
          result.modelFiles.push(processedModel);
        }
      } catch (error) {
        logger.warn('Failed to extract file from ZIP', {
          filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info('ZIP extraction completed', {
      originalFile: zipFile.name,
      extractedFiles: result.extractedCount,
      images: result.images.length,
      modelFiles: result.modelFiles.length,
      totalSize: result.totalSize
    });

    return result;
  } catch (error) {
    logger.error('ZIP extraction failed', {
      filename: zipFile.name,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error(`Failed to extract ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process individual files (non-ZIP)
 */
export async function categorizeFiles(files: File[]): Promise<ProcessedFiles> {
  const result: ProcessedFiles = {
    images: [],
    modelFiles: [],
    totalSize: 0,
    extractedCount: 0
  };

  for (const file of files) {
    result.totalSize += file.size;
    result.extractedCount++;

    try {
      if (isImageFile(file)) {
        const preview = await createImagePreview(file);
        const processedImage: ProcessedImageFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
          category: categorizeImage(file.name)
        };
        result.images.push(processedImage);
      } else if (isModelFile(file)) {
        const processedModel: ProcessedModelFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          fileType: getModelFileType(file.name)
        };
        result.modelFiles.push(processedModel);
      }
    } catch (error) {
      logger.warn('Failed to process file', {
        filename: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return result;
}

/**
 * Main file processing function
 * Handles both ZIP archives and individual files
 */
export async function processUploadedFiles(files: File[]): Promise<ProcessedFiles> {
  // Validate files first
  const validation = validateFiles(files);
  if (!validation.isValid) {
    throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
  }

  // Separate ZIP files from other files
  const zipFiles = files.filter(isArchiveFile);
  const otherFiles = files.filter(file => !isArchiveFile(file));

  let result: ProcessedFiles = {
    images: [],
    modelFiles: [],
    totalSize: 0,
    extractedCount: 0
  };

  // Process ZIP files
  for (const zipFile of zipFiles) {
    const zipResult = await extractZipFiles(zipFile);
    result.images.push(...zipResult.images);
    result.modelFiles.push(...zipResult.modelFiles);
    result.totalSize += zipResult.totalSize;
    result.extractedCount += zipResult.extractedCount;
  }

  // Process individual files
  if (otherFiles.length > 0) {
    const fileResult = await categorizeFiles(otherFiles);
    result.images.push(...fileResult.images);
    result.modelFiles.push(...fileResult.modelFiles);
    result.totalSize += fileResult.totalSize;
    result.extractedCount += fileResult.extractedCount;
  }

  return result;
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function cleanupPreviews(processedFiles: ProcessedFiles): void {
  processedFiles.images.forEach(image => {
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
  });
}

/**
 * Get MIME type from filename extension
 */
function getMimeTypeFromFilename(filename: string): string {
  const extension = getFileExtension(filename);
  
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg', 
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.stl': 'model/stl',
    '.3mf': 'application/vnd.ms-3mfdocument',
    '.gcode': 'text/plain',
    '.obj': 'model/obj'
  };

  return mimeMap[extension] || 'application/octet-stream';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}