// Security configuration for FM5 application
// This module provides security middleware and configurations

import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'

// Rate limiting configurations
export const rateLimiters = {
  // General API rate limiting
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks
    skip: (req) => req.path === '/api/health'
  }),

  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  }),

  // File upload rate limiting
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
    message: {
      error: 'Upload limit exceeded, please try again later.',
      retryAfter: '1 hour'
    }
  })
}

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-Forwarded-For',
    'X-Real-IP'
  ]
}

// Helmet security configuration
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React development
        "'unsafe-eval'", // Required for React development
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      connectSrc: [
        "'self'",
        'https:',
        'wss:', // WebSocket connections
        process.env.NODE_ENV === 'development' ? 'ws:' : null
      ].filter(Boolean),
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: []
    }
  }
}

// Input validation and sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* event handlers
    .trim()
}

// File upload security
export const fileUploadSecurity = {
  limits: {
    fileSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024, // 5MB default
    files: 5 // Max 5 files per request
  },
  
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',')
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false)
    }
  },
  
  filename: (req, file, cb) => {
    // Generate secure filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2)
    const extension = file.originalname.split('.').pop()
    const secureFilename = `${timestamp}_${randomString}.${extension}`
    cb(null, secureFilename)
  }
}

// Security middleware for API routes
export const securityMiddleware = {
  // Validate request size
  validateRequestSize: (maxSize = 1024 * 1024) => (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0')
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        maxSize: maxSize
      })
    }
    next()
  },

  // Validate Content-Type for POST/PUT requests
  validateContentType: (allowedTypes = ['application/json']) => (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type')
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        return res.status(415).json({
          error: 'Unsupported Media Type',
          allowedTypes: allowedTypes
        })
      }
    }
    next()
  },

  // Basic request validation
  validateRequest: (req, res, next) => {
    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-host', 'x-forwarded-server']
    for (const header of suspiciousHeaders) {
      if (req.get(header) && req.get(header) !== req.get('host')) {
        return res.status(400).json({ error: 'Invalid request' })
      }
    }
    
    // Validate User-Agent (basic check)
    const userAgent = req.get('User-Agent')
    if (!userAgent || userAgent.length < 10) {
      return res.status(400).json({ error: 'Invalid User-Agent' })
    }
    
    next()
  }
}

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    isProduction,
    
    // Cookie settings
    session: {
      secure: isProduction, // Only send cookies over HTTPS in production
      httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // CSRF protection
    csrf: {
      enabled: isProduction,
      cookieName: '_csrf',
      secretLength: 32
    },
    
    // Trusted proxy settings
    proxy: {
      trust: isProduction ? ['127.0.0.1', '::1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'] : false
    }
  }
}