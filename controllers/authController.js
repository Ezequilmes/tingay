const { db, auth } = require('../config/firebase-admin');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  });
};

// Helper function to get user from Firestore
const getUserFromFirestore = async (uid) => {
  if (!db) return null;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return { uid, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

// Helper function to create user in Firestore
const createUserInFirestore = async (uid, userData) => {
  if (!db) return false;
  try {
    await db.collection('users').doc(uid).set({
      ...userData,
      createdAt: new Date(),
      lastActive: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    return false;
  }
};

// Helper function to update user in Firestore
const updateUserInFirestore = async (uid, userData) => {
  if (!db) return false;
  try {
    await db.collection('users').doc(uid).update({
      ...userData,
      lastActive: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    return false;
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      age,
      location,
      genderIdentity,
      sexualOrientation,
      bio,
      preferredLanguage
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name || !age || !location || !genderIdentity || !sexualOrientation) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos para el registro'
      });
    }

    // Firebase mode - use Firebase Authentication and Firestore
    if (!auth || !db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available - registration disabled'
      });
    }

    // Create user with Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name
    });

    // Create user profile in Firestore
    const userData = {
      username: username,
      email: email,
      name: name,
      age: parseInt(age),
      location: location,
      genderIdentity: genderIdentity,
      sexualOrientation: sexualOrientation,
      bio: bio || 'Nueva cuenta en Tingay',
      preferredLanguage: preferredLanguage || 'es',
      profilePhoto: null,
      additionalPhotos: [],
      privateAlbum: []
    };

    const created = await createUserInFirestore(userRecord.uid, userData);
    if (!created) {
      // If Firestore creation fails, delete the Firebase Auth user
      await auth.deleteUser(userRecord.uid);
      return res.status(500).json({
        success: false,
        message: 'Error creating user profile'
      });
    }

    // Generate JWT token
    const token = generateToken(userRecord.uid);

    res.status(201).json({
       success: true,
       token: token,
       user: {
         uid: userRecord.uid,
         ...userData
       }
     });

   } catch (error) {
     console.error('Registration error:', error);
     res.status(500).json({
       success: false,
       message: error.message || 'Error during registration'
     });
   }
 };

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Firebase mode - use Firebase Authentication and Firestore
    if (!auth || !db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available - login disabled'
      });
    }

    // Get user by email from Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile from Firestore
    const userProfile = await getUserFromFirestore(userRecord.uid);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Generate JWT token
    const token = generateToken(userRecord.uid);

    res.json({
       success: true,
       token: token,
       user: userProfile
     });

   } catch (error) {
     console.error('Login error:', error);
     res.status(500).json({
       success: false,
       message: error.message || 'Error during login'
     });
   }
 };

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    // Firebase mode - use Firebase Authentication and Firestore
    if (!auth || !db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    // Get user profile from Firestore
    const userProfile = await getUserFromFirestore(req.user.id);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting user profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    // Fields that are allowed to be updated
    const updatableFields = [
      'name',
      'bio',
      'location',
      'genderIdentity',
      'sexualOrientation',
      'interests',
      'preferredLanguage',
      'preferences',
      'profilePhoto',
      'additionalPhotos',
      'privateAlbum'
    ];

    // Filter out fields that are not allowed to be updated
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (updatableFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Firebase mode - use Firebase Authentication and Firestore
    if (!auth || !db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    // Update user profile in Firestore
    const updated = await updateUserInFirestore(req.user.id, updateData);
    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user profile'
      });
    }

    // Get updated user profile
    const userProfile = await getUserFromFirestore(req.user.id);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found after update'
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};