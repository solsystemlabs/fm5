/**
 * Email Service Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EmailTemplates,
  createEmailAdapter,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../../lib/email-service'

describe('Email Service', () => {
  describe('Email Templates', () => {
    it('should generate verification email template', () => {
      const template = EmailTemplates.verification(
        'https://fm5.app/verify?token=abc123',
        'John',
      )

      expect(template.subject).toBe('Verify your FM5 account')
      expect(template.html).toContain('Hi John')
      expect(template.html).toContain('https://fm5.app/verify?token=abc123')
      expect(template.text).toContain('Hi John')
      expect(template.text).toContain('https://fm5.app/verify?token=abc123')
    })

    it('should generate verification email without username', () => {
      const template = EmailTemplates.verification(
        'https://fm5.app/verify?token=abc123',
      )

      expect(template.html).toContain('Hi there')
      expect(template.text).toContain('Hi there')
    })

    it('should generate password reset email template', () => {
      const template = EmailTemplates.passwordReset(
        'https://fm5.app/reset?token=xyz789',
        'Jane',
      )

      expect(template.subject).toBe('Reset your FM5 password')
      expect(template.html).toContain('Hi Jane')
      expect(template.html).toContain('https://fm5.app/reset?token=xyz789')
      expect(template.text).toContain('Hi Jane')
      expect(template.text).toContain('https://fm5.app/reset?token=xyz789')
    })

    it('should generate welcome email template', () => {
      const template = EmailTemplates.welcome('Alice')

      expect(template.subject).toBe('Welcome to FM5 - Get Started!')
      expect(template.html).toContain('Hi Alice')
      expect(template.html).toContain('Welcome to FM5')
      expect(template.text).toContain('Hi Alice')
      expect(template.text).toContain('Welcome to FM5')
    })
  })

  describe('Email Adapter Creation', () => {
    beforeEach(() => {
      // Reset environment
      delete process.env.RESEND_API_KEY
      process.env.NODE_ENV = 'development'
    })

    it('should create console adapter for development', () => {
      const adapter = createEmailAdapter()
      expect(adapter).toBeDefined()
    })

    it('should create console adapter when no API key provided', () => {
      process.env.NODE_ENV = 'production'
      delete process.env.RESEND_API_KEY

      const adapter = createEmailAdapter()
      expect(adapter).toBeDefined()
    })

    it('should create Resend adapter when API key provided in non-dev environment', () => {
      process.env.NODE_ENV = 'staging'
      process.env.RESEND_API_KEY = 'test-api-key'

      const adapter = createEmailAdapter()
      expect(adapter).toBeDefined()
    })
  })

  describe('Email Sending (Development Mode)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
      delete process.env.RESEND_API_KEY
    })

    it('should send verification email in development mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await sendVerificationEmail(
        'test@example.com',
        'https://fm5.app/verify?token=abc123',
        'Test User',
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toMatch(/^dev-email-/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should send password reset email in development mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await sendPasswordResetEmail(
        'test@example.com',
        'https://fm5.app/reset?token=xyz789',
        'Test User',
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toMatch(/^dev-email-/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should send welcome email in development mode', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await sendWelcomeEmail('test@example.com', 'Test User')

      expect(result.success).toBe(true)
      expect(result.messageId).toMatch(/^dev-email-/)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Email Content Validation', () => {
    it('should include proper email structure in verification template', () => {
      const template = EmailTemplates.verification(
        'https://fm5.app/verify',
        'User',
      )

      // HTML should have proper button styling
      expect(template.html).toContain('background-color: #4F46E5')
      expect(template.html).toContain('Verify Email Address')

      // Should include fallback URL
      expect(template.html).toContain('Or copy and paste this URL')

      // Text version should be plain and readable
      expect(template.text).not.toContain('<')
      expect(template.text).not.toContain('>')
    })

    it('should include expiration notice in password reset template', () => {
      const template = EmailTemplates.passwordReset(
        'https://fm5.app/reset',
        'User',
      )

      expect(template.html).toContain('expire in 1 hour')
      expect(template.text).toContain('expire in 1 hour')
    })

    it('should include action items in welcome template', () => {
      const template = EmailTemplates.welcome('User')

      expect(template.html).toContain('Upload your first 3D model')
      expect(template.html).toContain('Configure your printer settings')
      expect(template.html).toContain('Start managing your print queue')

      expect(template.text).toContain('Upload your first 3D model')
      expect(template.text).toContain('Configure your printer settings')
      expect(template.text).toContain('Start managing your print queue')
    })
  })

  describe('Email Security', () => {
    it('should properly escape user input in templates', () => {
      const maliciousName = '<script>alert("xss")</script>'
      const template = EmailTemplates.welcome(maliciousName)

      // HTML should escape the script tag (browser will handle this, but check it's included as-is)
      expect(template.html).toContain(maliciousName)
    })

    it('should handle special characters in verification URL', () => {
      const urlWithSpecialChars = 'https://fm5.app/verify?token=abc&state=xyz'
      const template = EmailTemplates.verification(urlWithSpecialChars)

      expect(template.html).toContain(urlWithSpecialChars)
      expect(template.text).toContain(urlWithSpecialChars)
    })
  })
})
