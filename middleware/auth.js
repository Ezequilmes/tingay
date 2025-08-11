const jwt = require('jsonwebtoken');
const { db, auth } = require('../config/firebase-admin');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with specific algorithm
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });

      // Get user from Firebase
      if (!db) {
        return res.status(503).json({
          success: false,
          message: 'Firebase not available'
        });
      }

      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(decoded.id).get();
      if (!userDoc.exists) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = { id: decoded.id, uid: decoded.id, ...userDoc.data() };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required'
    });
  }
  next();
};

module.exports = {
  protect,
  requireVerification
};