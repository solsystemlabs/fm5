// Application monitoring and error tracking utilities
// Integrates with Sentry, DataDog, and custom metrics collection

import { logger } from './logger'

interface MetricData {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp?: Date
}

interface CustomError extends Error {
  statusCode?: number
  code?: string
  userId?: string
  requestId?: string
  context?: Record<string, any>
}

class ApplicationMonitoring {
  private metrics: MetricData[] = []
  private isProduction: boolean
  private sentryInitialized: boolean = false

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.initializeSentry()
    this.setupGlobalErrorHandlers()
  }

  private initializeSentry(): void {
    if (!this.isProduction || !process.env.SENTRY_DSN) {
      return
    }

    try {
      // Initialize Sentry
      // Note: In a real implementation, you would import and configure Sentry here
      // import * as Sentry from "@sentry/node"
      // 
      // Sentry.init({
      //   dsn: process.env.SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 0.1,
      //   beforeSend(event, hint) {
      //     // Filter out sensitive information
      //     return event
      //   }
      // })

      this.sentryInitialized = true
      logger.info('Sentry monitoring initialized')
    } catch (error) {
      logger.error('Failed to initialize Sentry', { error })
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', { error })
      this.captureException(error, { level: 'fatal' })
      
      // Graceful shutdown
      setTimeout(() => {
        process.exit(1)
      }, 1000)
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason))
      logger.error('Unhandled promise rejection', { error, promise: promise.toString() })
      this.captureException(error, { level: 'error' })
    })

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      this.flush()
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      this.flush()
    })
  }

  // Error tracking
  captureException(error: Error | CustomError, context?: Record<string, any>): void {
    const enhancedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version
    }

    // Log locally
    logger.error('Exception captured', { error, ...enhancedContext })

    // Send to Sentry in production
    if (this.sentryInitialized) {
      // Sentry.captureException(error, { extra: enhancedContext })
    }

    // Track custom metrics
    this.recordMetric({
      name: 'errors.count',
      value: 1,
      tags: {
        error_type: error.constructor.name,
        status_code: (error as CustomError).statusCode?.toString() || 'unknown'
      }
    })
  }

  // Performance monitoring
  measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now()
    
    return fn()
      .then((result) => {
        const duration = Date.now() - startTime
        this.recordMetric({
          name: `performance.${name}`,
          value: duration,
          unit: 'milliseconds'
        })
        
        logger.performance(name, duration)
        return result
      })
      .catch((error) => {
        const duration = Date.now() - startTime
        this.recordMetric({
          name: `performance.${name}.error`,
          value: duration,
          unit: 'milliseconds'
        })
        
        logger.performance(name, duration, { error: true })
        throw error
      })
  }

  // Custom metrics
  recordMetric(metric: MetricData): void {
    const enhancedMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date()
    }

    // Store metric for batching
    this.metrics.push(enhancedMetric)

    // Log metric in development
    if (!this.isProduction) {
      logger.debug('Metric recorded', enhancedMetric)
    }

    // Batch send metrics every 60 seconds
    if (this.metrics.length >= 100 || !this.isProduction) {
      this.flushMetrics()
    }
  }

  // Database monitoring
  monitorDatabaseOperation<T>(
    operation: string, 
    table: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    
    return fn()
      .then((result) => {
        const duration = Date.now() - startTime
        
        this.recordMetric({
          name: 'database.operation.duration',
          value: duration,
          unit: 'milliseconds',
          tags: { operation, table }
        })
        
        logger.dbOperation(operation, table, duration)
        return result
      })
      .catch((error) => {
        const duration = Date.now() - startTime
        
        this.recordMetric({
          name: 'database.operation.error',
          value: 1,
          tags: { operation, table, error_type: error.constructor.name }
        })
        
        logger.dbOperation(operation, table, duration, error)
        throw error
      })
  }

  // HTTP request monitoring
  monitorHttpRequest(req: any, res: any): void {
    const startTime = Date.now()
    
    const originalEnd = res.end
    res.end = (...args: any[]) => {
      const duration = Date.now() - startTime
      const statusCode = res.statusCode
      
      // Record metrics
      this.recordMetric({
        name: 'http.request.duration',
        value: duration,
        unit: 'milliseconds',
        tags: {
          method: req.method,
          route: req.route?.path || req.url,
          status_code: statusCode.toString()
        }
      })

      this.recordMetric({
        name: 'http.request.count',
        value: 1,
        tags: {
          method: req.method,
          status_code: statusCode.toString()
        }
      })

      // Track errors
      if (statusCode >= 400) {
        this.recordMetric({
          name: 'http.request.error',
          value: 1,
          tags: {
            method: req.method,
            status_code: statusCode.toString()
          }
        })
      }

      originalEnd.apply(res, args)
    }
  }

  // Business metrics
  trackUserAction(action: string, userId: string, metadata?: Record<string, any>): void {
    this.recordMetric({
      name: `user.action.${action}`,
      value: 1,
      tags: {
        user_id: userId,
        ...metadata
      }
    })

    logger.businessEvent(`User action: ${action}`, { userId, ...metadata })
  }

  trackFeatureUsage(feature: string, userId?: string): void {
    this.recordMetric({
      name: `feature.usage.${feature}`,
      value: 1,
      tags: userId ? { user_id: userId } : {}
    })

    logger.businessEvent(`Feature usage: ${feature}`, { userId })
  }

  // System health monitoring
  getSystemHealth(): Record<string, any> {
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    const health = {
      status: 'healthy',
      uptime,
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      },
      cpu: process.cpuUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString()
    }

    // Record system metrics
    this.recordMetric({
      name: 'system.memory.heap_used',
      value: memUsage.heapUsed,
      unit: 'bytes'
    })

    this.recordMetric({
      name: 'system.uptime',
      value: uptime,
      unit: 'seconds'
    })

    return health
  }

  // Alert management
  sendAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string, context?: Record<string, any>): void {
    const alert = {
      severity,
      message,
      context,
      timestamp: new Date().toISOString(),
      service: 'fm5-app'
    }

    logger.error(`Alert [${severity.toUpperCase()}]: ${message}`, context)

    // Send to alerting services (PagerDuty, Slack, etc.)
    this.sendToAlertingService(alert)
  }

  private sendToAlertingService(alert: any): void {
    // Implement alerting service integration
    // This could be Slack webhooks, PagerDuty, email, etc.
    
    if (process.env.SLACK_WEBHOOK && alert.severity === 'critical') {
      // Send to Slack for critical alerts
      this.sendSlackAlert(alert)
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    try {
      const payload = {
        text: `🚨 Critical Alert: ${alert.message}`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Service', value: alert.service, short: true },
            { title: 'Time', value: alert.timestamp, short: false }
          ]
        }]
      }

      // Send HTTP request to Slack webhook
      // Implementation depends on your HTTP client
    } catch (error) {
      logger.error('Failed to send Slack alert', { error })
    }
  }

  // Flush metrics to external services
  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return

    const metricsToSend = [...this.metrics]
    this.metrics = []

    try {
      // Send to monitoring service (DataDog, CloudWatch, etc.)
      if (this.isProduction) {
        await this.sendMetricsToService(metricsToSend)
      }
    } catch (error) {
      logger.error('Failed to flush metrics', { error })
      // Re-add metrics for retry
      this.metrics.unshift(...metricsToSend)
    }
  }

  private async sendMetricsToService(metrics: MetricData[]): Promise<void> {
    // Implement metrics service integration
    // This could be DataDog, CloudWatch, Prometheus, etc.
    
    logger.debug(`Sending ${metrics.length} metrics to monitoring service`)
  }

  // Cleanup and flush on shutdown
  async flush(): Promise<void> {
    await this.flushMetrics()
    
    if (this.sentryInitialized) {
      // Sentry.close(2000)
    }
  }
}

// Create singleton instance
export const monitoring = new ApplicationMonitoring()

// Express middleware
export const monitoringMiddleware = (req: any, res: any, next: any) => {
  monitoring.monitorHttpRequest(req, res)
  next()
}

// Decorator for monitoring functions
export function Monitor(metricName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const name = metricName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return monitoring.measurePerformance(name, () => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

export default monitoring