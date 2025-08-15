// Centralized logging configuration for FM5 application
// Supports both development console logging and production structured logging

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn' 
  INFO: 'info'
  DEBUG: 'debug'
}

interface LogContext {
  userId?: string
  requestId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: Error
  [key: string]: any
}

class Logger {
  private logLevel: string
  private isProduction: boolean
  private serviceName: string
  private version: string

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info'
    this.isProduction = process.env.NODE_ENV === 'production'
    this.serviceName = 'fm5-app'
    this.version = process.env.npm_package_version || '1.0.0'
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatMessage(level: string, message: string, context: LogContext = {}): any {
    const timestamp = new Date().toISOString()
    const baseLog = {
      timestamp,
      level,
      service: this.serviceName,
      version: this.version,
      message,
      ...context
    }

    if (this.isProduction) {
      // Structured JSON logging for production
      return JSON.stringify(baseLog)
    } else {
      // Human-readable logging for development
      const contextStr = Object.keys(context).length > 0 
        ? `\n${JSON.stringify(context, null, 2)}` 
        : ''
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
    }
  }

  private log(level: string, message: string, context: LogContext = {}): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)
    
    // Output to appropriate stream
    switch (level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'debug':
        console.debug(formattedMessage)
        break
      default:
        console.log(formattedMessage)
    }

    // Send to external logging service in production
    if (this.isProduction && level === 'error') {
      this.sendToExternalService(level, message, context)
    }
  }

  private async sendToExternalService(level: string, message: string, context: LogContext): Promise<void> {
    try {
      // Send to Sentry, DataDog, CloudWatch, etc.
      if (process.env.SENTRY_DSN) {
        // Sentry integration would go here
        // This is a placeholder for the actual Sentry implementation
      }

      // Send to CloudWatch if in AWS
      if (process.env.AWS_REGION) {
        // CloudWatch logs integration would go here
      }
    } catch (error) {
      // Avoid infinite logging loops
      console.error('Failed to send log to external service:', error)
    }
  }

  // Public logging methods
  error(message: string, context: LogContext = {}): void {
    this.log('error', message, context)
  }

  warn(message: string, context: LogContext = {}): void {
    this.log('warn', message, context)
  }

  info(message: string, context: LogContext = {}): void {
    this.log('info', message, context)
  }

  debug(message: string, context: LogContext = {}): void {
    this.log('debug', message, context)
  }

  // HTTP request logging
  httpRequest(req: any, res: any, duration: number): void {
    const context: LogContext = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      sessionId: req.session?.id
    }

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    this.log(level, `HTTP ${req.method} ${req.url}`, context)
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration: number, error?: Error): void {
    const context: LogContext = {
      operation,
      table,
      duration,
      error
    }

    const level = error ? 'error' : duration > 1000 ? 'warn' : 'debug'
    const message = error 
      ? `Database ${operation} failed on ${table}` 
      : `Database ${operation} on ${table}`
    
    this.log(level, message, context)
  }

  // Authentication logging
  authEvent(event: string, userId?: string, success: boolean = true, error?: Error): void {
    const context: LogContext = {
      authEvent: event,
      userId,
      success,
      error
    }

    const level = !success ? 'warn' : 'info'
    this.log(level, `Authentication event: ${event}`, context)
  }

  // Business logic logging
  businessEvent(event: string, context: LogContext = {}): void {
    this.log('info', `Business event: ${event}`, context)
  }

  // Performance monitoring
  performance(operation: string, duration: number, context: LogContext = {}): void {
    const level = duration > 5000 ? 'warn' : 'debug'
    const enhancedContext = { ...context, duration, operation }
    
    this.log(level, `Performance: ${operation} took ${duration}ms`, enhancedContext)
  }

  // Security events
  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context: LogContext = {}): void {
    const level = ['critical', 'high'].includes(severity) ? 'error' : 'warn'
    const enhancedContext = { ...context, securityEvent: event, severity }
    
    this.log(level, `Security event: ${event}`, enhancedContext)
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now()
  
  // Generate request ID
  req.requestId = Math.random().toString(36).substring(2, 15)
  
  // Override res.end to capture response details
  const originalEnd = res.end
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime
    logger.httpRequest(req, res, duration)
    originalEnd.apply(res, args)
  }
  
  next()
}

// Error handling middleware
export const errorLogger = (error: Error, req: any, res: any, next: any) => {
  logger.error('Unhandled error', {
    error,
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })
  
  next(error)
}

// Database query logger (for Prisma)
export const createDatabaseLogger = () => {
  return {
    query: (e: any) => {
      const duration = e.duration
      logger.dbOperation('query', e.target || 'unknown', duration)
    },
    info: (e: any) => {
      logger.debug('Database info', { message: e.message })
    },
    warn: (e: any) => {
      logger.warn('Database warning', { message: e.message })
    },
    error: (e: any) => {
      logger.error('Database error', { 
        message: e.message,
        target: e.target 
      })
    }
  }
}

export default logger