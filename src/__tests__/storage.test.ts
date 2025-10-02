/**
 * Storage Service Tests
 *
 * Tests unified storage interface for both MinIO (dev) and R2 (staging/prod)
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  createStorageAdapter,
  generateFilePath,
  validateFileOwnership,
  validateFileSize,
  validateFileType,
} from '../../lib/storage'
import type { StorageAdapter, WorkerEnv } from '../../lib/storage'

describe('Storage Service', () => {
  let storage: StorageAdapter
  let minioAvailable = false

  beforeAll(async () => {
    // Create MinIO adapter for testing (local development simulation)
    storage = createStorageAdapter()

    // Test MinIO connectivity
    try {
      await storage.head('connectivity-test')
      minioAvailable = true
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('MinIO not available, skipping integration tests')
        minioAvailable = false
      } else {
        // Other errors (like 'NotFound') mean MinIO is working
        minioAvailable = true
      }
    }
  })

  describe('File Path Generation', () => {
    it('should generate correct file path with user and model isolation', () => {
      const path = generateFilePath('user123', 'model456', 'test.stl')
      expect(path).toBe('users/user123/models/model456/test.stl')
    })

    it('should sanitize filename to prevent path traversal', () => {
      const path = generateFilePath(
        'user123',
        'model456',
        '../../../etc/passwd',
      )
      // Path traversal patterns are removed
      expect(path).toBe('users/user123/models/model456/etcpasswd')
    })

    it('should sanitize special characters in filename', () => {
      const path = generateFilePath('user123', 'model456', 'file name (1).stl')
      expect(path).toBe('users/user123/models/model456/filename1.stl')
    })
  })

  describe('File Ownership Validation', () => {
    it('should validate correct file ownership', () => {
      const key = 'users/user123/models/model456/test.stl'
      expect(validateFileOwnership(key, 'user123')).toBe(true)
    })

    it('should reject invalid file ownership', () => {
      const key = 'users/user123/models/model456/test.stl'
      expect(validateFileOwnership(key, 'user999')).toBe(false)
    })

    it('should reject path traversal attempts', () => {
      const key = 'users/../../etc/passwd'
      expect(validateFileOwnership(key, 'user123')).toBe(false)
    })
  })

  describe('File Size Validation', () => {
    it('should accept valid file sizes', () => {
      expect(validateFileSize(1024)).toBe(true)
      expect(validateFileSize(50 * 1024 * 1024)).toBe(true) // 50MB
    })

    it('should reject files that are too large', () => {
      expect(validateFileSize(200 * 1024 * 1024)).toBe(false) // 200MB > 100MB default
    })

    it('should reject zero or negative sizes', () => {
      expect(validateFileSize(0)).toBe(false)
      expect(validateFileSize(-1)).toBe(false)
    })

    it('should respect custom max size', () => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      expect(validateFileSize(5 * 1024 * 1024, maxSize)).toBe(true)
      expect(validateFileSize(15 * 1024 * 1024, maxSize)).toBe(false)
    })
  })

  describe('File Type Validation', () => {
    it('should accept allowed file types', () => {
      expect(validateFileType('model/stl')).toBe(true)
      expect(validateFileType('application/sla')).toBe(true)
      expect(validateFileType('model/obj')).toBe(true)
      expect(validateFileType('application/octet-stream')).toBe(true)
    })

    it('should reject disallowed file types', () => {
      expect(validateFileType('image/png')).toBe(false)
      expect(validateFileType('text/html')).toBe(false)
      expect(validateFileType('application/javascript')).toBe(false)
    })

    it('should respect custom allowed types', () => {
      const allowedTypes = ['image/png', 'image/jpeg']
      expect(validateFileType('image/png', allowedTypes)).toBe(true)
      expect(validateFileType('model/stl', allowedTypes)).toBe(false)
    })
  })

  describe('Storage Operations', () => {
    const testUserId = 'test-user-' + Date.now()
    const testModelId = 'test-model-' + Date.now()
    const testFilename = 'test-file.stl'
    const testKey = generateFilePath(testUserId, testModelId, testFilename)

    afterAll(async () => {
      // Cleanup: delete test file if it exists
      if (minioAvailable) {
        try {
          await storage.delete(testKey)
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    })

    it.skipIf(!minioAvailable)(
      'should upload a file successfully',
      async () => {
        const content = 'Test file content for storage test'
        const result = await storage.put(testKey, content, {
          contentType: 'model/stl',
          metadata: {
            userId: testUserId,
            modelId: testModelId,
          },
        })

        expect(result.key).toBe(testKey)
        expect(result.size).toBeGreaterThan(0)
        expect(result.etag).toBeDefined()
        expect(result.uploaded).toBeInstanceOf(Date)
      },
    )

    it.skipIf(!minioAvailable)('should check if file exists', async () => {
      const metadata = await storage.head(testKey)
      expect(metadata).not.toBeNull()
      expect(metadata?.key).toBe(testKey)
      expect(metadata?.size).toBeGreaterThan(0)
    })

    it.skipIf(!minioAvailable)(
      'should download a file successfully',
      async () => {
        const result = await storage.get(testKey)
        expect(result).not.toBeNull()
        if (!result) return

        expect(result.body).toBeInstanceOf(ReadableStream)
        expect(result.metadata.key).toBe(testKey)

        // Read stream content
        const reader = result.body.getReader()
        const chunks: Array<Uint8Array> = []
        let readResult = await reader.read()
        while (!readResult.done) {
          chunks.push(readResult.value)
          readResult = await reader.read()
        }
        const content = new TextDecoder().decode(Buffer.concat(chunks))
        expect(content).toBe('Test file content for storage test')
      },
    )

    it.skipIf(!minioAvailable)('should list files with prefix', async () => {
      const prefix = `users/${testUserId}/`
      const result = await storage.list({ prefix, limit: 10 })

      expect(result.objects).toBeDefined()
      expect(Array.isArray(result.objects)).toBe(true)
      expect(result.objects.length).toBeGreaterThan(0)
      expect(result.objects[0].key).toContain(testUserId)
    })

    it.skipIf(!minioAvailable)(
      'should delete a file successfully',
      async () => {
        await storage.delete(testKey)

        // Verify deletion
        const metadata = await storage.head(testKey)
        expect(metadata).toBeNull()
      },
    )

    it.skipIf(!minioAvailable)(
      'should return null for non-existent file',
      async () => {
        const nonExistentKey = 'users/nonexistent/models/fake/test.stl'
        const result = await storage.get(nonExistentKey)
        expect(result).toBeNull()
      },
    )

    it.skipIf(!minioAvailable)('should handle blob uploads', async () => {
      const blob = new Blob(['Blob test content'], { type: 'model/stl' })
      const blobKey = generateFilePath(testUserId, testModelId, 'blob-test.stl')

      const result = await storage.put(blobKey, blob, {
        contentType: 'model/stl',
      })

      expect(result.key).toBe(blobKey)
      expect(result.size).toBeGreaterThan(0)

      // Cleanup
      await storage.delete(blobKey)
    })

    it.skipIf(!minioAvailable)(
      'should handle ArrayBuffer uploads',
      async () => {
        const buffer = new TextEncoder().encode('ArrayBuffer test content')
        const bufferKey = generateFilePath(
          testUserId,
          testModelId,
          'buffer-test.stl',
        )

        const result = await storage.put(bufferKey, buffer.buffer, {
          contentType: 'model/stl',
        })

        expect(result.key).toBe(bufferKey)
        expect(result.size).toBeGreaterThan(0)

        // Cleanup
        await storage.delete(bufferKey)
      },
    )
  })

  describe('Storage Adapter Creation', () => {
    it('should create MinIO adapter for local development', () => {
      const adapter = createStorageAdapter()
      expect(adapter).toBeDefined()
    })

    it('should create R2 adapter when FILE_STORAGE binding provided', () => {
      const mockR2Bucket = {
        put: vi.fn(),
        get: vi.fn(),
        head: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
        createMultipartUpload: vi.fn(),
        resumeMultipartUpload: vi.fn(),
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type R2Bucket = import('@cloudflare/workers-types').R2Bucket
      const env: WorkerEnv = { FILE_STORAGE: mockR2Bucket as R2Bucket }
      const adapter = createStorageAdapter(env)
      expect(adapter).toBeDefined()
    })
  })
})
