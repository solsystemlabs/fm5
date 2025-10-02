/**
 * Developer Tools tRPC Router
 *
 * Provides testing endpoints for external services (R2, Resend, health checks).
 * Only available in development and staging environments.
 */

import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { createStorageAdapter, generateFilePath } from '../storage'
import { EmailTemplates, createEmailAdapter } from '../email-service'
import { performHealthCheck } from '../health-check'

export const devRouter = createTRPCRouter({
  /**
   * Test R2/MinIO file upload
   */
  testFileUpload: publicProcedure
    .input(
      z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string().default('application/octet-stream'),
      }),
    )
    .mutation(async ({ input }) => {
      const storage = createStorageAdapter()

      // Use test user/model IDs
      const testUserId = 'test-user'
      const testModelId = 'test-model'
      const key = generateFilePath(testUserId, testModelId, input.filename)

      const result = await storage.put(key, input.content, {
        contentType: input.contentType,
        metadata: {
          testUpload: 'true',
          uploadedAt: new Date().toISOString(),
        },
      })

      return {
        success: true,
        key: result.key,
        size: result.size,
        etag: result.etag,
      }
    }),

  /**
   * Test R2/MinIO file download
   */
  testFileDownload: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const storage = createStorageAdapter()

      const result = await storage.get(input.key)

      if (!result) {
        throw new Error('File not found')
      }

      // Read stream content
      const reader = result.body.getReader()
      const chunks: Array<Uint8Array> = []
      let readResult = await reader.read()
      while (!readResult.done) {
        chunks.push(readResult.value)
        readResult = await reader.read()
      }
      const content = new TextDecoder().decode(Buffer.concat(chunks))

      return {
        success: true,
        key: result.metadata.key,
        content,
        contentType: result.metadata.contentType,
        size: result.metadata.size,
      }
    }),

  /**
   * Test email sending
   */
  testEmailSend: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        template: z.enum(['verification', 'passwordReset', 'welcome']),
        userName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const adapter = createEmailAdapter()

      let emailTemplate
      switch (input.template) {
        case 'verification':
          emailTemplate = EmailTemplates.verification(
            'https://fm5.app/verify?token=test-token',
            input.userName,
          )
          break
        case 'passwordReset':
          emailTemplate = EmailTemplates.passwordReset(
            'https://fm5.app/reset?token=test-token',
            input.userName,
          )
          break
        case 'welcome':
          emailTemplate = EmailTemplates.welcome(input.userName || 'Test User')
          break
      }

      const result = await adapter.send({
        to: input.to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      })

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      }
    }),

  /**
   * Get service health status
   */
  getServiceHealth: publicProcedure.query(async () => {
    const healthResult = await performHealthCheck()

    return healthResult
  }),

  /**
   * List test files
   */
  listTestFiles: publicProcedure.query(async () => {
    const storage = createStorageAdapter()

    const testUserId = 'test-user'
    const result = await storage.list({
      prefix: `users/${testUserId}/`,
      limit: 50,
    })

    return {
      files: result.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        contentType: obj.contentType,
      })),
      truncated: result.truncated,
    }
  }),

  /**
   * Delete test file
   */
  deleteTestFile: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const storage = createStorageAdapter()

      await storage.delete(input.key)

      return {
        success: true,
        key: input.key,
      }
    }),
})
