/**
 * Unified Storage Interface
 *
 * Abstracts storage operations to work with both:
 * - MinIO (local development)
 * - Cloudflare R2 (staging/production)
 *
 * Environment detection:
 * - Development: Uses MinIO via S3-compatible API
 * - Staging/Production: Uses Cloudflare R2 via Workers binding
 *
 * @see docs/architecture/deployment-infrastructure.md
 */

import * as Minio from 'minio'

// Conditional R2 type import - only available in Cloudflare Workers
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type R2Bucket = import('@cloudflare/workers-types').R2Bucket

// Environment bindings type with optional R2 bucket
export interface WorkerEnv {
  FILE_STORAGE?: R2Bucket
}

/**
 * Storage operation result
 */
export interface StorageObject {
  key: string
  size: number
  etag: string
  uploaded: Date
  contentType?: string
  metadata?: Record<string, string>
}

/**
 * Storage list result
 */
export interface StorageListResult {
  objects: Array<StorageObject>
  truncated: boolean
  cursor?: string
}

/**
 * Storage interface for both MinIO and R2
 */
export interface StorageAdapter {
  /**
   * Uploads a file to storage
   */
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options: {
      contentType: string
      metadata?: Record<string, string>
    }
  ) => Promise<StorageObject>

  /**
   * Downloads a file from storage
   */
  get: (key: string) => Promise<{
    body: ReadableStream
    metadata: StorageObject
  } | null>

  /**
   * Checks if a file exists
   */
  head: (key: string) => Promise<StorageObject | null>

  /**
   * Deletes a file
   */
  delete: (key: string) => Promise<void>

  /**
   * Lists files with a prefix
   */
  list: (options: {
    prefix?: string
    limit?: number
    cursor?: string
  }) => Promise<StorageListResult>
}

/**
 * MinIO Storage Adapter (for local development)
 */
class MinioAdapter implements StorageAdapter {
  private client: Minio.Client
  private bucketName: string

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000'
    const useSSL = endpoint.startsWith('https://')
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, '')
    const [host, portStr] = cleanEndpoint.split(':')
    const port = portStr ? parseInt(portStr, 10) : 9000

    this.client = new Minio.Client({
      endPoint: host,
      port,
      useSSL,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    })

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'printmgmt-dev'
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucketName)
    if (!exists) {
      await this.client.makeBucket(this.bucketName, 'us-east-1')
    }
  }

  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options: {
      contentType: string
      metadata?: Record<string, string>
    }
  ): Promise<StorageObject> {
    await this.ensureBucket()

    let buffer: Buffer
    if (value instanceof ReadableStream) {
      const chunks: Array<Uint8Array> = []
      const reader = value.getReader()
      let readResult = await reader.read()
      while (!readResult.done) {
        chunks.push(readResult.value)
        readResult = await reader.read()
      }
      buffer = Buffer.concat(chunks)
    } else if (value instanceof ArrayBuffer) {
      buffer = Buffer.from(value)
    } else if (value instanceof Blob) {
      buffer = Buffer.from(await value.arrayBuffer())
    } else {
      buffer = Buffer.from(value)
    }

    const metadata = {
      'Content-Type': options.contentType,
      ...options.metadata,
    }

    const result = await this.client.putObject(
      this.bucketName,
      key,
      buffer,
      buffer.length,
      metadata
    )

    return {
      key,
      size: buffer.length,
      etag: result.etag,
      uploaded: new Date(),
      contentType: options.contentType,
      metadata: options.metadata,
    }
  }

  async get(key: string): Promise<{
    body: ReadableStream
    metadata: StorageObject
  } | null> {
    try {
      const stream = await this.client.getObject(this.bucketName, key)
      const stat = await this.client.statObject(this.bucketName, key)

      // Convert Node.js stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => controller.enqueue(chunk))
          stream.on('end', () => controller.close())
          stream.on('error', (err) => controller.error(err))
        },
      })

      return {
        body: webStream,
        metadata: {
          key,
          size: stat.size,
          etag: stat.etag,
          uploaded: stat.lastModified,
          contentType: stat.metaData['content-type'],
          metadata: stat.metaData,
        },
      }
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return null
      }
      throw error
    }
  }

  async head(key: string): Promise<StorageObject | null> {
    try {
      const stat = await this.client.statObject(this.bucketName, key)
      return {
        key,
        size: stat.size,
        etag: stat.etag,
        uploaded: stat.lastModified,
        contentType: stat.metaData['content-type'],
        metadata: stat.metaData,
      }
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return null
      }
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucketName, key)
  }

  async list(options: {
    prefix?: string
    limit?: number
  }): Promise<StorageListResult> {
    const objects: Array<StorageObject> = []
    const stream = this.client.listObjects(
      this.bucketName,
      options.prefix || '',
      false
    )

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (options.limit && objects.length >= options.limit) {
          stream.destroy()
          return
        }
        objects.push({
          key: obj.name || '',
          size: obj.size || 0,
          etag: obj.etag || '',
          uploaded: obj.lastModified || new Date(),
        })
      })
      stream.on('end', () => {
        resolve({
          objects,
          truncated: false,
        })
      })
      stream.on('error', reject)
    })
  }
}

/**
 * R2 Storage Adapter (for staging/production in Cloudflare Workers)
 */
class R2Adapter implements StorageAdapter {
  constructor(private bucket: R2Bucket) {}

  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | string | Blob,
    options: {
      contentType: string
      metadata?: Record<string, string>
    }
  ): Promise<StorageObject> {
    // Convert Blob/ReadableStream to ArrayBuffer to avoid type conflicts
    // between Node.js and Cloudflare Workers type definitions
    let uploadValue: ArrayBuffer | string
    if (value instanceof Blob) {
      uploadValue = await value.arrayBuffer()
    } else if (value instanceof ReadableStream) {
      const chunks: Array<Uint8Array> = []
      const reader = value.getReader()
      let readResult = await reader.read()
      while (!readResult.done) {
        chunks.push(readResult.value)
        readResult = await reader.read()
      }
      uploadValue = Buffer.concat(chunks).buffer
    } else if (value instanceof ArrayBuffer) {
      uploadValue = value
    } else {
      uploadValue = value
    }

    const object = await this.bucket.put(key, uploadValue, {
      httpMetadata: {
        contentType: options.contentType,
      },
      customMetadata: options.metadata,
    })

    return {
      key: object.key,
      size: object.size,
      etag: object.etag,
      uploaded: object.uploaded,
      contentType: options.contentType,
      metadata: options.metadata,
    }
  }

  async get(key: string): Promise<{
    body: ReadableStream
    metadata: StorageObject
  } | null> {
    const object = await this.bucket.get(key)
    if (!object) return null

    return {
      body: object.body as ReadableStream,
      metadata: {
        key: object.key,
        size: object.size,
        etag: object.etag,
        uploaded: object.uploaded,
        contentType: object.httpMetadata?.contentType,
        metadata: object.customMetadata,
      },
    }
  }

  async head(key: string): Promise<StorageObject | null> {
    const object = await this.bucket.head(key)
    if (!object) return null

    return {
      key: object.key,
      size: object.size,
      etag: object.etag,
      uploaded: object.uploaded,
      contentType: object.httpMetadata?.contentType,
      metadata: object.customMetadata,
    }
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key)
  }

  async list(options: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<StorageListResult> {
    const result = await this.bucket.list({
      prefix: options.prefix,
      limit: options.limit,
      cursor: options.cursor,
    })

    return {
      objects: result.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        etag: obj.etag,
        uploaded: obj.uploaded,
        contentType: obj.httpMetadata?.contentType,
        metadata: obj.customMetadata,
      })),
      truncated: result.truncated,
      cursor: result.truncated ? result.cursor : undefined,
    }
  }
}

/**
 * Creates a storage adapter based on the environment
 *
 * Automatically detects environment and returns appropriate adapter:
 * - Development: MinIO adapter
 * - Staging/Production: R2 adapter (when FILE_STORAGE binding available)
 *
 * @param env - Optional Cloudflare Workers environment bindings
 * @returns Storage adapter instance
 */
export function createStorageAdapter(env?: WorkerEnv): StorageAdapter {
  const nodeEnv = process.env.NODE_ENV || process.env.APP_ENV

  // Check if we have R2 binding and not in development
  if (env?.FILE_STORAGE && nodeEnv !== 'development') {
    return new R2Adapter(env.FILE_STORAGE)
  }

  // Use MinIO for local development or when R2 not available
  return new MinioAdapter()
}

/**
 * Generates a secure file path with user isolation
 */
export function generateFilePath(
  userId: string,
  modelId: string,
  filename: string
): string {
  // Remove path traversal patterns and path separators first
  let sanitizedFilename = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '')
  // Remove any remaining invalid characters, keeping only alphanumeric, dots, underscores, and hyphens
  sanitizedFilename = sanitizedFilename.replace(/[^a-zA-Z0-9._-]/g, '')
  return `users/${userId}/models/${modelId}/${sanitizedFilename}`
}

/**
 * Validates user ownership of a file
 */
export function validateFileOwnership(key: string, userId: string): boolean {
  return key.startsWith(`users/${userId}/`)
}

/**
 * Validates file size
 */
export function validateFileSize(
  size: number,
  maxSize: number = 100 * 1024 * 1024 // 100MB default
): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Validates file type
 */
export function validateFileType(
  contentType: string,
  allowedTypes: Array<string> = [
    'model/stl',
    'application/sla',
    'model/obj',
    'application/octet-stream',
  ]
): boolean {
  return allowedTypes.includes(contentType)
}
