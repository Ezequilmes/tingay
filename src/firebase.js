// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "soygay-b9bc5.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://soygay-b9bc5-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "soygay-b9bc5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "soygay-b9bc5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "861549470388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:861549470388:web:47d409ba77edfd07eaede1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HH1GMTQBSF"
};

// Validate configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing. Check your environment variables.');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check with reCAPTCHA Enterprise
let appCheck;

// Enable App Check with reCAPTCHA Enterprise
const ENABLE_APP_CHECK = true; // reCAPTCHA Enterprise is now configured

if (ENABLE_APP_CHECK) {
  try {
    // Enable debug mode in development
    if (import.meta.env.DEV) {
      // Set debug token for development
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.log('App Check debug mode enabled for development');
    }
    
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI';
    
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
    
    console.log('App Check initialized with reCAPTCHA Enterprise site key:', recaptchaSiteKey.substring(0, 10) + '...');
    console.log('App Check initialized successfully');
  } catch (error) {
    console.warn('App Check initialization failed:', error.message);
    console.warn('App will continue without App Check. Some features may be limited.');
    // Continue without App Check in case of errors
  }
} else {
  console.warn('⚠️ App Check is temporarily disabled');
  console.warn('📋 To enable App Check:');
  console.warn('   1. Configure reCAPTCHA Enterprise in Google Cloud Console');
  console.warn('   2. Update Firebase App Check settings');
  console.warn('   3. Set ENABLE_APP_CHECK = true in firebase.js');
  console.warn('   4. See RECAPTCHA_ENTERPRISE_SETUP.md for detailed instructions');
}

// Inicializar servicios
export const auth = getAuth(app);
// Especificar explícitamente el ID de la base de datos para evitar errores de conexión
export const db = getFirestore(app, '(default)');
export const storage = getStorage(app);

export default app;