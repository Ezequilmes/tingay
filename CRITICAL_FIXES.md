# Correcciones Críticas para Errores Identificados

## 🚨 Error JWT Crítico Detectado

**Error encontrado en el servidor**:
```
JsonWebTokenError: invalid algorithm
```

**Ubicación**: `middleware/auth.js:15`  
**Causa**: Problema con la configuración del algoritmo JWT  
**Impacto**: Autenticación completamente rota

### Solución Inmediata:

1. **Actualizar middleware de autenticación**:
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { db, auth } = require('../config/firebase-admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verificar token con algoritmo específico
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'] // Especificar algoritmo
      });

      if (!db) {
        return res.status(503).json({
          success: false,
          message: 'Firebase not available'
        });
      }

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
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

module.exports = { protect };
```

2. **Actualizar generación de tokens**:
```javascript
// controllers/authController.js - función generateToken
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256' // Especificar algoritmo
  });
};
```

## 🔧 Corrección de Dependencia Vulnerable

### Actualizar Multer
```bash
npm uninstall multer
npm install multer@^2.0.0
```

### Actualizar código que usa Multer
```javascript
// Si hay código que usa multer, verificar compatibilidad con v2
// La API cambió ligeramente en v2
```

## 🔐 Mejorar Seguridad JWT

### Generar nuevo JWT Secret
```bash
# Generar un secret fuerte
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Actualizar .env
```env
# Reemplazar el JWT_SECRET actual con uno generado
JWT_SECRET=tu_nuevo_secret_generado_aqui
JWT_EXPIRES_IN=7d
JWT_ALGORITHM=HS256
```

## 🔥 Configuración Firebase con Variables de Entorno

### Actualizar .env
```env
# Firebase Frontend Configuration
VITE_FIREBASE_API_KEY=AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw
VITE_FIREBASE_AUTH_DOMAIN=soygay-b9bc5.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://soygay-b9bc5-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=soygay-b9bc5
VITE_FIREBASE_STORAGE_BUCKET=soygay-b9bc5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=861549470388
VITE_FIREBASE_APP_ID=1:861549470388:web:47d409ba77edfd07eaede1
VITE_FIREBASE_MEASUREMENT_ID=G-HH1GMTQBSF
```

### Actualizar src/firebase.js
```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

// Configuración desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validar configuración
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase configuration is missing. Check your environment variables.');
}

const app = initializeApp(firebaseConfig);

// App Check con manejo de errores mejorado
let appCheck;
try {
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI'),
    isTokenAutoRefreshEnabled: true
  });
  
  console.log('App Check initialized successfully');
} catch (error) {
  console.warn('App Check initialization failed:', error);
  // Continuar sin App Check en caso de error
}

export const auth = getAuth(app);
export const db = getFirestore(app, '(default)');
export const storage = getStorage(app);
export default app;
```

## 🛡️ Mejorar Validación de Entrada

### Instalar express-validator
```bash
npm install express-validator
```

### Ejemplo de validación para rutas
```javascript
// routes/users.js - agregar validaciones
const { body, validationResult } = require('express-validator');

// Middleware de validación
const validateLike = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters'),
];

// Usar en la ruta
router.post('/like', auth, validateLike, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  
  // Resto del código...
});
```

## 🔄 Mejorar Manejo de Errores

### Middleware global de errores
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Authentication failed'
    });
  }
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input'
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Something went wrong'
  });
};

module.exports = errorHandler;
```

### Usar en server.js
```javascript
// server.js - al final, antes de app.listen
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);
```

## 📋 Orden de Implementación

1. **INMEDIATO** - Corregir error JWT (servidor no funciona)
2. **URGENTE** - Actualizar Multer (vulnerabilidad de seguridad)
3. **IMPORTANTE** - Mover configuración Firebase a variables de entorno
4. **RECOMENDADO** - Implementar validación de entrada
5. **OPCIONAL** - Mejorar manejo de errores global

## 🧪 Verificación

Después de cada corrección:

```bash
# Verificar que el servidor inicie sin errores
npm run dev:backend

# Verificar que el frontend compile
npm run build

# Verificar dependencias
npm audit

# Probar autenticación
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

**⚠️ IMPORTANTE**: Implementar estas correcciones en orden de prioridad. El error JWT debe corregirse primero ya que impide el funcionamiento básico de la aplicación.