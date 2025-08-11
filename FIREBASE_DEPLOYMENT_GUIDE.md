# Guía para Subir el Proyecto a Firebase Hosting

## 📋 Prerrequisitos

1. **Firebase CLI instalado**:
```bash
npm install -g firebase-tools
```

2. **Autenticación con Firebase**:
```bash
firebase login
```

3. **Proyecto ya inicializado** (✅ Ya está configurado)

## 🚀 Pasos para Deployment

### 1. Preparar el Build de Producción

```bash
# Instalar dependencias (si es necesario)
npm install

# Crear build de producción
npm run build
```

Esto creará la carpeta `dist/` con los archivos optimizados.

### 2. Verificar Configuración de Firebase

El archivo `firebase.json` ya está configurado:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. Deploy a Firebase Hosting

```bash
# Deploy completo (hosting + reglas + funciones)
firebase deploy

# O solo hosting
firebase deploy --only hosting
```

### 4. Verificar el Deployment

Después del deploy, Firebase te dará:
- **URL de producción**: `https://soygay-b9bc5.web.app`
- **URL alternativa**: `https://soygay-b9bc5.firebaseapp.com`

## 🔧 Configuración Específica para tu Proyecto

### Variables de Entorno para Producción

Crea un archivo `.env.production` con:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw
VITE_FIREBASE_AUTH_DOMAIN=soygay-b9bc5.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://soygay-b9bc5-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=soygay-b9bc5
VITE_FIREBASE_STORAGE_BUCKET=soygay-b9bc5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=861549470388
VITE_FIREBASE_APP_ID=1:861549470388:web:47d409ba77edfd07eaede1
VITE_FIREBASE_MEASUREMENT_ID=G-HH1GMTQBSF

# Production settings
NODE_ENV=production
```

### Script de Deployment Automatizado

Crea `deploy.bat` para Windows:
```batch
@echo off
echo Iniciando deployment a Firebase...

echo 1. Instalando dependencias...
npm install

echo 2. Creando build de producción...
npm run build

echo 3. Desplegando a Firebase Hosting...
firebase deploy --only hosting

echo ✅ Deployment completado!
echo URL: https://soygay-b9bc5.web.app
pause
```

## 📱 Configuración del Backend

### Opción 1: Backend en Firebase Functions (Recomendado)

1. **Mover el backend a Functions**:
```bash
cd functions
npm install express cors socket.io
```

2. **Actualizar `functions/src/index.ts`**:
```typescript
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));

// Importar tus rutas aquí
// app.use('/api', routes);

export const api = functions.https.onRequest(app);
```

3. **Deploy functions**:
```bash
firebase deploy --only functions
```

### Opción 2: Backend Externo

Si mantienes el backend separado, actualiza las URLs en el frontend:

```javascript
// src/services/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-backend-url.com/api'
  : 'http://localhost:3001/api';
```

## 🔐 Configuraciones de Seguridad

### 1. Configurar Dominios Autorizados

En Firebase Console > Authentication > Settings > Authorized domains:
- Agregar: `soygay-b9bc5.web.app`
- Agregar: `soygay-b9bc5.firebaseapp.com`

### 2. Configurar App Check

En Firebase Console > App Check:
1. Registrar la aplicación web
2. Usar el site key: `6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI`
3. Habilitar enforcement para Firestore y Storage

### 3. Actualizar CORS para Storage

```bash
# Aplicar configuración CORS
gsutil cors set cors.json gs://soygay-b9bc5.firebasestorage.app
```

## 📊 Monitoreo y Analytics

### Firebase Analytics
Ya está configurado con `measurementId: G-HH1GMTQBSF`

### Performance Monitoring
```bash
npm install firebase/performance
```

```javascript
// src/firebase.js
import { getPerformance } from 'firebase/performance';

if (typeof window !== 'undefined') {
  const perf = getPerformance(app);
}
```

## 🚨 Checklist Pre-Deployment

- [ ] ✅ Build de producción funciona (`npm run build`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ⚠️ App Check configurado en Firebase Console
- [ ] ⚠️ Dominios autorizados agregados
- [ ] ⚠️ Permisos IAM de Storage resueltos
- [ ] ⚠️ Backend desplegado o URLs actualizadas
- [ ] ⚠️ CORS configurado para Storage

## 🎯 Comandos Rápidos

```bash
# Deployment completo
npm run build && firebase deploy

# Solo hosting
npm run build && firebase deploy --only hosting

# Preview antes de deploy
firebase hosting:channel:deploy preview

# Ver logs
firebase functions:log

# Rollback si hay problemas
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

## 🔗 URLs Importantes

- **Aplicación**: https://soygay-b9bc5.web.app
- **Console**: https://console.firebase.google.com/project/soygay-b9bc5
- **Analytics**: https://analytics.google.com

## ⚠️ Problemas Comunes

### Error: "Firebase project not found"
```bash
firebase use soygay-b9bc5
```

### Error: "Build folder not found"
```bash
npm run build
```

### Error: "Permission denied"
```bash
firebase login --reauth
```

### Error 404 en rutas
Verificar que `firebase.json` tenga la configuración de rewrites.

---

**¡Tu proyecto ya está listo para ser desplegado!** Solo ejecuta `npm run build && firebase deploy` y estará disponible en https://soygay-b9bc5.web.app