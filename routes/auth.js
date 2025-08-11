const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register route
router.post('/register', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  next();
}, authController.register);

// Login route
router.post('/login', (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  next();
}, authController.login);

// Get current user profile
router.get('/me', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  next();
}, authController.getMe);

// Update user profile
router.put('/profile', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  next();
}, authController.updateProfile);

module.exports = router;