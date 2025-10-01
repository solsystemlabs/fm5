/**
 * Resend Email Service
 *
 * Provides email delivery with environment-specific configuration.
 *
 * Environments:
 * - Development: Logs emails to console instead of sending
 * - Staging: Uses Resend with staging API key
 * - Production: Uses Resend with production API key
 *
 * @see docs/architecture/deployment-infrastructure.md
 */

import {  Resend } from 'resend'
import type {CreateEmailResponse} from 'resend';

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string | Array<string>
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string | Array<string>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Email service adapter interface
 */
export interface EmailAdapter {
  send: (options: SendEmailOptions) => Promise<EmailResult>
}

/**
 * Resend Email Adapter (for staging/production)
 */
class ResendAdapter implements EmailAdapter {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const result: CreateEmailResponse = await this.client.emails.send({
        from: options.from || 'noreply@fm5.app',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
        }
      }

      return {
        success: true,
        messageId: result.data.id,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }
  }
}

/**
 * Console Email Adapter (for local development)
 */
class ConsoleAdapter implements EmailAdapter {
  send(options: SendEmailOptions): Promise<EmailResult> {
    console.log('═══════════════════════════════════════════════════════')
    console.log('📧 [DEV MODE] Email would be sent:')
    console.log('From:', options.from || 'noreply@fm5.app')
    console.log('To:', options.to)
    console.log('Subject:', options.subject)
    console.log('───────────────────────────────────────────────────────')
    console.log('HTML Content:')
    console.log(options.html)
    if (options.text) {
      console.log('───────────────────────────────────────────────────────')
      console.log('Text Content:')
      console.log(options.text)
    }
    console.log('═══════════════════════════════════════════════════════')

    return Promise.resolve({
      success: true,
      messageId: `dev-email-${Date.now()}`,
    })
  }
}

/**
 * Creates an email adapter based on environment
 */
export function createEmailAdapter(): EmailAdapter {
  const apiKey = process.env.RESEND_API_KEY
  const env = process.env.NODE_ENV || process.env.APP_ENV

  // Use console adapter for development
  if (env === 'development' || !apiKey) {
    return new ConsoleAdapter()
  }

  // Use Resend for staging/production
  return new ResendAdapter(apiKey)
}

/**
 * Email Templates
 */
export const EmailTemplates = {
  /**
   * User verification email template
   */
  verification(verificationUrl: string, userName?: string): EmailTemplate {
    const greeting = userName ? `Hi ${userName}` : 'Hi there'

    return {
      subject: 'Verify your FM5 account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to FM5!</h2>
          <p>${greeting},</p>
          <p>Thank you for signing up. Please verify your email address to get started.</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Or copy and paste this URL into your browser:<br>
            <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
          </p>
        </div>
      `,
      text: `
Welcome to FM5!

${greeting},

Thank you for signing up. Please verify your email address to get started.

Verify your email: ${verificationUrl}

If you didn't create an account, you can safely ignore this email.
      `.trim(),
    }
  },

  /**
   * Password reset email template
   */
  passwordReset(resetUrl: string, userName?: string): EmailTemplate {
    const greeting = userName ? `Hi ${userName}` : 'Hi there'

    return {
      subject: 'Reset your FM5 password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>${greeting},</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Or copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
          </p>
        </div>
      `,
      text: `
Password Reset Request

${greeting},

We received a request to reset your password. Click the link below to create a new password.

Reset your password: ${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      `.trim(),
    }
  },

  /**
   * Welcome email template
   */
  welcome(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to FM5 - Get Started!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to FM5! 🎉</h2>
          <p>Hi ${userName},</p>
          <p>Your account is now verified and ready to use. Here's what you can do next:</p>
          <ul style="line-height: 1.8;">
            <li>Upload your first 3D model</li>
            <li>Configure your printer settings</li>
            <li>Start managing your print queue</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="https://fm5.app/dashboard"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Need help getting started? Check out our <a href="https://fm5.app/docs" style="color: #4F46E5;">documentation</a>
            or reply to this email.
          </p>
        </div>
      `,
      text: `
Welcome to FM5! 🎉

Hi ${userName},

Your account is now verified and ready to use. Here's what you can do next:

- Upload your first 3D model
- Configure your printer settings
- Start managing your print queue

Go to Dashboard: https://fm5.app/dashboard

Need help getting started? Check out our documentation at https://fm5.app/docs or reply to this email.
      `.trim(),
    }
  },
}

/**
 * Sends a verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  userName?: string
): Promise<EmailResult> {
  const adapter = createEmailAdapter()
  const template = EmailTemplates.verification(verificationUrl, userName)

  return adapter.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
): Promise<EmailResult> {
  const adapter = createEmailAdapter()
  const template = EmailTemplates.passwordReset(resetUrl, userName)

  return adapter.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Sends a welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResult> {
  const adapter = createEmailAdapter()
  const template = EmailTemplates.welcome(userName)

  return adapter.send({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}
