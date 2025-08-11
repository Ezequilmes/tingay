const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para usuarios
const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('User ID contains invalid characters'),
  handleValidationErrors
];

const validateLike = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('User ID contains invalid characters'),
  handleValidationErrors
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .trim()
    .escape(),
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim()
    .escape(),
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
    .trim()
    .escape(),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
    .custom((interests) => {
      if (interests.length > 10) {
        throw new Error('Maximum 10 interests allowed');
      }
      interests.forEach(interest => {
        if (typeof interest !== 'string' || interest.length > 30) {
          throw new Error('Each interest must be a string with max 30 characters');
        }
      });
      return true;
    }),
  handleValidationErrors
];

// Validaciones para chat
const validateMessage = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim(),
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isString()
    .withMessage('Receiver ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Receiver ID contains invalid characters'),
  handleValidationErrors
];

const validateChatId = [
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isString()
    .withMessage('Chat ID must be a string')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Chat ID contains invalid characters'),
  handleValidationErrors
];

// Validaciones para autenticación
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .isLength({ max: 100 })
    .withMessage('Password must be less than 100 characters'),
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .isLength({ max: 100 })
    .withMessage('Password must be less than 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .trim()
    .escape(),
  handleValidationErrors
];

// Validación para paginación
const validatePagination = [
  param('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer between 1 and 1000'),
  param('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserId,
  validateLike,
  validateProfileUpdate,
  validateMessage,
  validateChatId,
  validateLogin,
  validateRegister,
  validatePagination
};