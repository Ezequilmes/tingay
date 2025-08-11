const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app;

try {
  // In production, use service account key or default credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'soygay-b9bc5',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'soygay-b9bc5.firebasestorage.app'
    });
  } else {
    // Use default credentials (works in Firebase Functions or with GOOGLE_APPLICATION_CREDENTIALS)
    app = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'soygay-b9bc5',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'soygay-b9bc5.firebasestorage.app'
    });
  }
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.log('Running in development mode without Firebase Admin');
}

// Export Firebase services
const db = app ? admin.firestore() : null;
const auth = app ? admin.auth() : null;
const storage = app ? admin.storage() : null;

module.exports = {
  admin,
  db,
  auth,
  storage,
  isInitialized: !!app
};