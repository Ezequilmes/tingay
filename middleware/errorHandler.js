// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation error';
    error = {
      message,
      statusCode: 400
    };
  }

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    const message = getFirebaseAuthErrorMessage(err.code);
    error = {
      message,
      statusCode: 400
    };
  }

  if (err.code && err.code.startsWith('firestore/')) {
    const message = 'Database operation failed';
    error = {
      message,
      statusCode: 500
    };
  }

  // MongoDB/Database errors
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404
    };
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      message,
      statusCode: 400
    };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: 429
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400
    };
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    const message = 'Service temporarily unavailable';
    error = {
      message,
      statusCode: 503
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    })
  });
};

// Helper function to get user-friendly Firebase Auth error messages
const getFirebaseAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email address is already registered',
    'auth/weak-password': 'Password is too weak',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/invalid-credential': 'Invalid credentials provided',
    'auth/credential-already-in-use': 'This credential is already associated with another account',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/invalid-verification-id': 'Invalid verification ID',
    'auth/missing-verification-code': 'Verification code is required',
    'auth/missing-verification-id': 'Verification ID is required'
  };

  return errorMessages[errorCode] || 'Authentication error occurred';
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};