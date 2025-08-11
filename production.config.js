// Tingay Production Configuration
// This file contains production-specific settings and optimizations

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    
    // Security Headers
    security: {
      helmet: true,
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    }
  },
  
  // Firebase Configuration
  firebase: {
    enabled: !!process.env.FIREBASE_PROJECT_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '5mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    destination: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: {
      enabled: true,
      filename: 'logs/tingay.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }
  },
  
  // Cache Configuration
  cache: {
    redis: {
      enabled: !!process.env.REDIS_URL,
      url: process.env.REDIS_URL,
      ttl: 3600 // 1 hour default TTL
    },
    memory: {
      enabled: true,
      maxSize: 100, // Maximum number of items in cache
      ttl: 300 // 5 minutes default TTL
    }
  },
  
  // Email Configuration (for notifications)
  email: {
    enabled: !!process.env.EMAIL_SERVICE,
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@tingay.app'
  },
  
  // Push Notifications
  notifications: {
    firebase: {
      enabled: !!process.env.FIREBASE_SERVER_KEY,
      serverKey: process.env.FIREBASE_SERVER_KEY
    }
  },
  
  // Analytics
  analytics: {
    enabled: !!process.env.ANALYTICS_ID,
    googleAnalytics: process.env.ANALYTICS_ID
  },
  
  // Feature Flags
  features: {
    registration: process.env.ENABLE_REGISTRATION !== 'false',
    emailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    phoneVerification: process.env.REQUIRE_PHONE_VERIFICATION === 'true',
    geolocation: process.env.ENABLE_GEOLOCATION !== 'false',
    chat: process.env.ENABLE_CHAT !== 'false',
    hearts: process.env.ENABLE_HEARTS !== 'false',
    blocking: process.env.ENABLE_BLOCKING !== 'false'
  },
  
  // Performance Monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sentry: {
      enabled: !!process.env.SENTRY_DSN,
      dsn: process.env.SENTRY_DSN
    },
    newRelic: {
      enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY
    }
  },
  
  // Static Files
  static: {
    maxAge: process.env.STATIC_MAX_AGE || '1d',
    compression: true,
    etag: true
  },
  
  // Socket.IO Configuration
  socketio: {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  }
};