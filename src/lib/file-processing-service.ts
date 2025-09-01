import JSZip from "jszip";
import { FileEntityType } from "@prisma/client";
import { logger } from "./logger";

/**
 * Enhanced File Processing Service for FM5 Manager
 * Handles ZIP extraction, file categorization, and processing with proper 3MF hierarchy
 */

export interface ProcessedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface ProcessedImageFile extends ProcessedFile {
  preview: string; // blob URL for preview
  category: "thumbnail" | "preview" | "other";
}

export interface ProcessedModelFile extends ProcessedFile {
  fileType: "stl" | "obj" | "other"; // Non-3MF model files only
}

// New interface for 3MF containers with embedded images
export interface ProcessedThreeMFFile extends ProcessedFile {
  fileType: "3mf";
  images: ProcessedImageFile[]; // Images extracted from this specific 3MF
  hasGcode: boolean; // .gcode.3mf vs .3mf
}

// Enhanced ProcessedFiles interface with proper hierarchy
export interface ProcessedFiles {
  images: ProcessedImageFile[]; // Standalone images from ZIP or direct upload
  modelFiles: ProcessedModelFile[]; // Non-3MF model files (STL, OBJ, etc.)
  threeMFFiles: ProcessedThreeMFFile[]; // 3MF files with their embedded images
  totalSize: number;
  extractedCount: number;
}

// Helper type for file record creation with tagged union
export interface FileRecord {
  name: string;
  url: string;
  size: number;
  s3Key?: string;
  mimeType?: string;
  entityType: FileEntityType;
  entityId: number;
}

export interface ExtractionProgress {
  extractedCount: number;
  totalCount: number;
  percentage: number;
  currentFile?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Enhanced supported file types configuration
 */
export const SUPPORTED_FILE_TYPES = {
  images: {
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/bmp",
      "image/webp",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  modelFiles: {
    extensions: [".stl", ".obj"], // Non-3MF model files only
    mimeTypes: ["model/stl", "model/obj", "application/octet-stream"],
    maxSize: 500 * 1024 * 1024, // 100MB
  },
  threeMFFiles: {
    extensions: [".3mf"], // 3MF containers (separate from modelFiles)
    mimeTypes: ["application/vnd.ms-3mfdocument"],
    maxSize: 500 * 1024 * 1024, // 100MB
  },
  slicedFiles: {
    extensions: [".gcode", ".gcode.3mf"],
    mimeTypes: ["application/gcode"],
    maxSize: 500 * 1024 * 1024,
  },
  archives: {
    extensions: [".zip"],
    mimeTypes: ["application/zip", "application/x-zip-compressed"],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
};

/**
 * Image file patterns for categorization
 */
const IMAGE_PATTERNS = {
  thumbnail: /^(plate_\d+(?:_small)?\.png|thumbnail\.(?:png|jpg|jpeg))$/i,
  preview:
    /^(top_\d+|pick_\d+|plate_no_light_\d+|preview\d*)\.(?:png|jpg|jpeg)$/i,
};

/**
 * Validate file types and sizes
 */
export function validateFiles(files: File[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  for (const file of files) {
    // Check file size (overall limit)
    const maxFileSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxFileSize) {
      result.errors.push(
        `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 500MB.`,
      );
      continue;
    }

    // Check if file type is supported
    const isImage = isImageFile(file);
    const isModel = isModelFile(file);
    const isArchive = isArchiveFile(file);
    const is3MF = is3MFFile(file);

    if (!isImage && !isModel && !isArchive && !is3MF) {
      result.errors.push(
        `File "${file.name}" has unsupported type. Supported: images, model files, 3MF files, and ZIP archives.`,
      );
    }

    // Specific size checks
    if (isImage && file.size > SUPPORTED_FILE_TYPES.images.maxSize) {
      result.errors.push(
        `Image "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size for images is 10MB.`,
      );
    }

    // Model files and 3MF files have no size limits
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

  return (
    SUPPORTED_FILE_TYPES.images.extensions.includes(extension) ||
    SUPPORTED_FILE_TYPES.images.mimeTypes.includes(mimeType)
  );
}

/**
 * Check if file is a model file
 */
export function isModelFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  return (
    SUPPORTED_FILE_TYPES.modelFiles.extensions.includes(extension) ||
    SUPPORTED_FILE_TYPES.modelFiles.mimeTypes.includes(mimeType)
  );
}

/**
 * Check if file is an archive
 */
export function isArchiveFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  return (
    SUPPORTED_FILE_TYPES.archives.extensions.includes(extension) ||
    SUPPORTED_FILE_TYPES.archives.mimeTypes.includes(mimeType)
  );
}

/**
 * Check if file is a 3MF file
 */
export function is3MFFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  return (
    SUPPORTED_FILE_TYPES.threeMFFiles.extensions.includes(extension) ||
    SUPPORTED_FILE_TYPES.threeMFFiles.mimeTypes.includes(mimeType)
  );
}

/**
 * Get file extension (with dot)
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Categorize image by filename patterns
 * TODO: This probably isn't needed
 */
function categorizeImage(filename: string): "thumbnail" | "preview" | "other" {
  if (IMAGE_PATTERNS.thumbnail.test(filename)) {
    return "thumbnail";
  }
  if (IMAGE_PATTERNS.preview.test(filename)) {
    return "preview";
  }
  return "other";
}

/**
 * Determine model file type (non-3MF files only)
 */
function getModelFileType(filename: string): "stl" | "obj" | "other" {
  const extension = getFileExtension(filename);

  if (extension === ".stl") return "stl";
  if (extension === ".obj") return "obj";
  return "other";
}

/**
 * Check if 3MF file has gcode embedded
 */
function hasGcodeEmbedded(filename: string): boolean {
  return filename.toLowerCase().endsWith(".gcode.3mf");
}

/**
 * Create blob URL for image preview (server-side compatible)
 */
export async function createImagePreview(file: File): Promise<string> {
  try {
    // Create a blob URL for browser environment (client-side)
    if (typeof window !== "undefined") {
      return URL.createObjectURL(file);
    }

    // For server-side processing, create a simple data URL without full base64 encoding
    // Just return a placeholder since we don't need actual previews on server
    return `data:${file.type};base64,placeholder`;
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract images from 3MF file
 * 3MF files are ZIP-based archives that can contain thumbnails and previews
 */
export async function extract3MFImages(
  threeMFFile: File,
): Promise<ProcessedImageFile[]> {
  logger.info("Starting 3MF image extraction", {
    filename: threeMFFile.name,
    size: threeMFFile.size,
  });

  try {
    // Convert File to ArrayBuffer for JSZip
    const arrayBuffer = await threeMFFile.arrayBuffer();

    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);

    const images: ProcessedImageFile[] = [];

    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and non-image files
      if (
        zipEntry.dir ||
        !filename.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i)
      ) {
        continue;
      }

      // 3MF files commonly have thumbnails in specific paths
      const is3MFThumbnail =
        filename.includes("Metadata") ||
        filename.includes("thumbnail") ||
        filename.match(/^3D\/Thumbnail\/.*\.(png|jpg|jpeg)$/i);

      try {
        const fileData = await zipEntry.async("arraybuffer");
        const extractedFile = new File([fileData], filename, {
          type: getMimeTypeFromFilename(filename),
        });

        if (isImageFile(extractedFile)) {
          const preview = await createImagePreview(extractedFile);
          const processedImage: ProcessedImageFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            preview,
            category: is3MFThumbnail ? "thumbnail" : "other",
          };
          images.push(processedImage);
        }
      } catch (error) {
        logger.warn("Failed to extract image from 3MF", {
          filename,
          threeMFFile: threeMFFile.name,
          error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
        });
      }
    }

    logger.info("3MF image extraction completed", {
      threeMFFile: threeMFFile.name,
      extractedImages: images.length,
    });

    return images;
  } catch (error) {
    logger.error("3MF image extraction failed", {
      filename: threeMFFile.name,
      error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
    });
    // Return empty array instead of throwing - 3MF might not have images
    return [];
  }
}

/**
 * Extract and process ZIP archive
 */
export async function extractZipFiles(zipFile: File): Promise<ProcessedFiles> {
  logger.info("Starting ZIP extraction", {
    filename: zipFile.name,
    size: zipFile.size,
  });

  try {
    // Convert File to ArrayBuffer for JSZip
    const arrayBuffer = await zipFile.arrayBuffer();

    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);

    const result: ProcessedFiles = {
      images: [],
      modelFiles: [],
      threeMFFiles: [],
      totalSize: 0,
      extractedCount: 0,
    };

    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and system files
      if (
        zipEntry.dir ||
        filename.startsWith("__MACOSX/") ||
        filename.startsWith(".DS_Store")
      ) {
        continue;
      }

      try {
        const fileData = await zipEntry.async("arraybuffer");
        const extractedFile = new File([fileData], filename, {
          type: getMimeTypeFromFilename(filename),
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
            category: categorizeImage(filename),
          };
          result.images.push(processedImage);
        } else if (isModelFile(extractedFile)) {
          const processedModel: ProcessedModelFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            fileType: getModelFileType(filename),
          };
          result.modelFiles.push(processedModel);
        }
      } catch (error) {
        logger.warn("Failed to extract file from ZIP", {
          filename,
          error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
        });
      }
    }

    logger.info("ZIP extraction completed", {
      originalFile: zipFile.name,
      extractedFiles: result.extractedCount,
      images: result.images.length,
      modelFiles: result.modelFiles.length,
      totalSize: result.totalSize,
    });

    return result;
  } catch (error) {
    logger.error("ZIP extraction failed", {
      filename: zipFile.name,
      error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
    });
    throw new Error(
      `Failed to extract ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Enhanced ZIP archive processing with proper 3MF hierarchy
 */
export async function extractZipFilesWithProgress(
  zipFile: File,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<ProcessedFiles> {
  logger.info("Starting enhanced ZIP extraction with 3MF hierarchy", {
    filename: zipFile.name,
    size: zipFile.size,
  });

  try {
    // Convert File to ArrayBuffer for JSZip
    const arrayBuffer = await zipFile.arrayBuffer();

    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);

    const result: ProcessedFiles = {
      images: [],
      modelFiles: [],
      threeMFFiles: [], // New: separate 3MF containers
      totalSize: 0,
      extractedCount: 0,
    };

    // Get list of files to process
    const filesToProcess = Object.entries(zipData.files).filter(
      ([filename, zipEntry]) =>
        !zipEntry.dir &&
        !filename.startsWith("__MACOSX/") &&
        !filename.startsWith(".DS_Store"),
    );

    logger.info("ZIP file contents found", {
      totalFiles: Object.keys(zipData.files).length,
      allFiles: Object.keys(zipData.files),
      filesToProcess: filesToProcess.length,
      fileList: filesToProcess.map(([filename, zipEntry]) => ({
        name: filename,
        size: 0, // JSZip doesn't expose uncompressed size in TypeScript definitions
        dir: zipEntry.dir,
        extension: getFileExtension(filename),
        mimeType: getMimeTypeFromFilename(filename),
      })),
    });

    const totalFiles = filesToProcess.length;
    let processedFiles = 0;

    for (const [filename, zipEntry] of filesToProcess) {
      // Report progress
      onProgress?.({
        extractedCount: processedFiles,
        totalCount: totalFiles,
        percentage: Math.round((processedFiles / totalFiles) * 100),
        currentFile: filename,
      });

      try {
        const fileData = await zipEntry.async("arraybuffer");
        const extractedFile = new File([fileData], filename, {
          type: getMimeTypeFromFilename(filename),
        });

        result.totalSize += extractedFile.size;
        result.extractedCount++;

        logger.info("Processing extracted file from ZIP", {
          filename,
          size: extractedFile.size,
          type: extractedFile.type,
          extension: getFileExtension(filename),
          isImage: isImageFile(extractedFile),
          is3MF: is3MFFile(extractedFile),
          isModel: isModelFile(extractedFile),
          supportedThreeMFExts: SUPPORTED_FILE_TYPES.threeMFFiles.extensions,
          supportedThreeMFMimes: SUPPORTED_FILE_TYPES.threeMFFiles.mimeTypes,
        });

        // Enhanced processing logic with proper 3MF separation
        if (is3MFFile(extractedFile)) {
          // Process 3MF file as container with embedded images
          logger.info("🔥 FOUND AND PROCESSING 3MF FILE FROM ZIP", {
            filename,
            size: extractedFile.size,
            hasGcode: hasGcodeEmbedded(filename),
            fileType: extractedFile.type,
            extension: getFileExtension(filename),
          });

          // Extract images from this specific 3MF file
          const embeddedImages = await extract3MFImages(extractedFile);

          const processedThreeMF: ProcessedThreeMFFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            fileType: "3mf",
            images: embeddedImages, // Images specific to this 3MF
            hasGcode: hasGcodeEmbedded(filename),
          };

          result.threeMFFiles.push(processedThreeMF);

          // Add embedded image sizes to total
          for (const image of embeddedImages) {
            result.totalSize += image.size;
          }
        } else if (isImageFile(extractedFile)) {
          // Standalone image in ZIP (not from any 3MF)
          const preview = await createImagePreview(extractedFile);
          const processedImage: ProcessedImageFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            preview,
            category: categorizeImage(filename),
          };
          result.images.push(processedImage);
        } else if (isModelFile(extractedFile)) {
          // Non-3MF model files (STL, OBJ, etc.)
          const processedModel: ProcessedModelFile = {
            file: extractedFile,
            name: filename,
            size: extractedFile.size,
            type: extractedFile.type,
            fileType: getModelFileType(filename),
          };
          result.modelFiles.push(processedModel);
        }

        processedFiles++;
      } catch (error) {
        logger.warn("Failed to extract file from ZIP", {
          filename,
          error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
        });
        processedFiles++;
      }
    }

    // Final progress update
    onProgress?.({
      extractedCount: processedFiles,
      totalCount: totalFiles,
      percentage: 100,
      currentFile: undefined,
    });

    logger.info("Enhanced ZIP extraction completed", {
      originalFile: zipFile.name,
      extractedFiles: result.extractedCount,
      standaloneImages: result.images.length,
      modelFiles: result.modelFiles.length,
      threeMFFiles: result.threeMFFiles.length,
      totalEmbeddedImages: result.threeMFFiles.reduce(
        (sum, tmf) => sum + tmf.images.length,
        0,
      ),
      totalSize: result.totalSize,
    });

    return result;
  } catch (error) {
    logger.error("Enhanced ZIP extraction failed", {
      filename: zipFile.name,
      error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
    });
    throw new Error(
      `Failed to extract ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Enhanced processing of individual files with 3MF support
 */
export async function categorizeFiles(files: File[]): Promise<ProcessedFiles> {
  const result: ProcessedFiles = {
    images: [],
    modelFiles: [],
    threeMFFiles: [], // New: support for 3MF files
    totalSize: 0,
    extractedCount: 0,
  };

  for (const file of files) {
    result.totalSize += file.size;
    result.extractedCount++;

    try {
      if (is3MFFile(file)) {
        // Process 3MF file as container with embedded images
        logger.info("Processing 3MF container", {
          filename: file.name,
          size: file.size,
          hasGcode: hasGcodeEmbedded(file.name),
        });

        const embeddedImages = await extract3MFImages(file);

        const processedThreeMF: ProcessedThreeMFFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          fileType: "3mf",
          images: embeddedImages,
          hasGcode: hasGcodeEmbedded(file.name),
        };

        result.threeMFFiles.push(processedThreeMF);

        // Add embedded image sizes to total
        for (const image of embeddedImages) {
          result.totalSize += image.size;
        }
      } else if (isImageFile(file)) {
        const preview = await createImagePreview(file);
        const processedImage: ProcessedImageFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
          category: categorizeImage(file.name),
        };
        result.images.push(processedImage);
      } else if (isModelFile(file)) {
        const processedModel: ProcessedModelFile = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          fileType: getModelFileType(file.name),
        };
        result.modelFiles.push(processedModel);
      }
    } catch (error) {
      logger.warn("Failed to process file", {
        filename: file.name,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
      });
    }
  }

  return result;
}

/**
 * Pre-scan ZIP file to count processable files (images and model files)
 */
async function getProcessableFileCountFromZip(zipFile: File): Promise<number> {
  try {
    const arrayBuffer = await zipFile.arrayBuffer();
    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);

    let count = 0;
    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      // Skip directories and system files
      if (
        zipEntry.dir ||
        filename.startsWith("__MACOSX/") ||
        filename.startsWith(".DS_Store")
      ) {
        continue;
      }

      // Check if file would be processable as image or model
      const extension = getFileExtension(filename);
      const mimeType = getMimeTypeFromFilename(filename);

      const isImage =
        SUPPORTED_FILE_TYPES.images.extensions.includes(extension) ||
        SUPPORTED_FILE_TYPES.images.mimeTypes.includes(mimeType);
      const isModel =
        SUPPORTED_FILE_TYPES.modelFiles.extensions.includes(extension) ||
        SUPPORTED_FILE_TYPES.modelFiles.mimeTypes.includes(mimeType);
      const is3MF =
        SUPPORTED_FILE_TYPES.threeMFFiles.extensions.includes(extension) ||
        SUPPORTED_FILE_TYPES.threeMFFiles.mimeTypes.includes(mimeType);

      if (isImage || isModel || is3MF) {
        count++;
      }
    }

    return count;
  } catch (error) {
    logger.warn("Failed to pre-scan ZIP file", {
      filename: zipFile.name,
      error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
    });
    return 1; // Fallback to at least 1 file
  }
}

/**
 * Main file processing function
 * Handles both ZIP archives and individual files
 */
export async function processUploadedFiles(
  files: File[],
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<ProcessedFiles> {
  // Validate files first
  const validation = validateFiles(files);
  if (!validation.isValid) {
    throw new Error(`File validation failed: ${validation.errors.join(", ")}`);
  }

  // Separate files by type
  const zipFiles = files.filter(isArchiveFile);
  const threeMFFiles = files.filter(is3MFFile);
  const otherFiles = files.filter(
    (file) => !isArchiveFile(file) && !is3MFFile(file),
  );

  let result: ProcessedFiles = {
    images: [],
    modelFiles: [],
    threeMFFiles: [], // New: support for 3MF files
    totalSize: 0,
    extractedCount: 0,
  };

  // Get actual file counts by pre-scanning ZIP files
  let totalProcessableFiles = otherFiles.length + threeMFFiles.length;

  // Pre-scan ZIP files to get accurate file counts
  const zipFileCounts: number[] = [];
  for (const zipFile of zipFiles) {
    const count = await getProcessableFileCountFromZip(zipFile);
    zipFileCounts.push(count);
    totalProcessableFiles += count;
  }

  let processedFiles = 0;

  // Process individual files first
  if (otherFiles.length > 0) {
    for (const file of otherFiles) {
      onProgress?.({
        extractedCount: processedFiles,
        totalCount: totalProcessableFiles,
        percentage: Math.round((processedFiles / totalProcessableFiles) * 100),
        currentFile: file.name,
      });

      const fileResult = await categorizeFiles([file]);
      result.images.push(...fileResult.images);
      result.modelFiles.push(...fileResult.modelFiles);
      result.totalSize += fileResult.totalSize;
      result.extractedCount += fileResult.extractedCount;

      processedFiles++;
    }
  }

  // Process 3MF files as containers (not regular model files)
  for (const threeMFFile of threeMFFiles) {
    onProgress?.({
      extractedCount: processedFiles,
      totalCount: totalProcessableFiles,
      percentage: Math.round((processedFiles / totalProcessableFiles) * 100),
      currentFile: threeMFFile.name,
    });

    try {
      logger.info("Processing 3MF container", {
        filename: threeMFFile.name,
        size: threeMFFile.size,
        hasGcode: hasGcodeEmbedded(threeMFFile.name),
      });

      // Extract images from this 3MF file
      const embeddedImages = await extract3MFImages(threeMFFile);

      // Create ProcessedThreeMFFile with embedded images
      const processedThreeMF: ProcessedThreeMFFile = {
        file: threeMFFile,
        name: threeMFFile.name,
        size: threeMFFile.size,
        type: threeMFFile.type,
        fileType: "3mf",
        images: embeddedImages, // Images specific to this 3MF
        hasGcode: hasGcodeEmbedded(threeMFFile.name),
      };

      result.threeMFFiles.push(processedThreeMF);
      result.totalSize += threeMFFile.size;
      result.extractedCount += 1;

      // Add embedded image sizes to total
      for (const image of embeddedImages) {
        result.totalSize += image.size;
      }

      logger.info("3MF container processing completed", {
        filename: threeMFFile.name,
        embeddedImages: embeddedImages.length,
        images: embeddedImages.map((img) => ({
          name: img.name,
          size: img.size,
          category: img.category,
        })),
      });
    } catch (error) {
      logger.warn("Failed to process 3MF container", {
        filename: threeMFFile.name,
        error: error instanceof Error ? error : new Error(error instanceof Error ? error.message : "Unknown error"),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    processedFiles++;
  }

  // Process ZIP files
  for (const zipFile of zipFiles) {
    onProgress?.({
      extractedCount: processedFiles,
      totalCount: totalProcessableFiles,
      percentage: Math.round((processedFiles / totalProcessableFiles) * 100),
      currentFile: zipFile.name,
    });

    const zipResult = await extractZipFilesWithProgress(
      zipFile,
      (zipProgress) => {
        // Update progress with ZIP extraction details
        onProgress?.({
          extractedCount: processedFiles + zipProgress.extractedCount,
          totalCount: totalProcessableFiles,
          percentage: Math.round(
            ((processedFiles + zipProgress.extractedCount) /
              totalProcessableFiles) *
              100,
          ),
          currentFile: zipProgress.currentFile || zipFile.name,
        });
      },
    );

    result.images.push(...zipResult.images);
    result.modelFiles.push(...zipResult.modelFiles);
    result.threeMFFiles.push(...zipResult.threeMFFiles); // New: merge 3MF files
    result.totalSize += zipResult.totalSize;
    result.extractedCount += zipResult.extractedCount;

    processedFiles += zipResult.extractedCount;
  }

  // Final progress update
  onProgress?.({
    extractedCount: processedFiles,
    totalCount: Math.max(totalProcessableFiles, processedFiles),
    percentage: 100,
    currentFile: undefined,
  });

  return result;
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export function cleanupPreviews(processedFiles: ProcessedFiles): void {
  processedFiles.images.forEach((image) => {
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
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".stl": "model/stl",
    ".3mf": "application/vnd.ms-3mfdocument",
    ".gcode": "text/plain",
    ".obj": "model/obj",
  };

  return mimeMap[extension] || "application/octet-stream";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

