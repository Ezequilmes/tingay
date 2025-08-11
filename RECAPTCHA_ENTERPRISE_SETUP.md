# Configuración de reCAPTCHA Enterprise para Firebase App Check

## ⚠️ PROBLEMA ACTUAL
La aplicación está usando una clave de reCAPTCHA Enterprise que no está correctamente configurada, causando el error:
```
net::ERR_ABORTED https://www.google.com/recaptcha/enterprise/clr?k=6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI
```

## 🔧 SOLUCIÓN PASO A PASO

### 1. Crear Nueva Clave reCAPTCHA Enterprise

1. **Ir a Google Cloud Console**:
   - Abrir: https://console.cloud.google.com/
   - Seleccionar proyecto: `soygay-b9bc5`

2. **Habilitar reCAPTCHA Enterprise API**:
   ```bash
   # En Cloud Shell o terminal local con gcloud CLI
   gcloud services enable recaptchaenterprise.googleapis.com --project=soygay-b9bc5
   ```

3. **Crear clave de sitio web**:
   - Ir a: https://console.cloud.google.com/security/recaptcha
   - Hacer clic en "Crear clave"
   - Configurar:
     - **Nombre**: `Tingay-Web-Production`
     - **Tipo**: `Sitio web`
     - **Dominios**:
       - `soygay-b9bc5.web.app`
       - `soygay-b9bc5.firebaseapp.com`
       - `localhost` (para desarrollo)
       - `127.0.0.1` (para desarrollo)
     - **Configuración avanzada**:
       - ✅ Usar puntuación basada en desafío (score-based)
       - ❌ NO marcar "Usar desafío de casilla de verificación"

### 2. Configurar Firebase App Check

1. **Ir a Firebase Console**:
   - Abrir: https://console.firebase.google.com/project/soygay-b9bc5
   - Ir a "App Check" en el menú lateral

2. **Registrar aplicación web**:
   - Hacer clic en "Registrar aplicación"
   - Seleccionar la aplicación web existente
   - **Proveedor**: reCAPTCHA Enterprise
   - **Clave secreta**: Copiar la clave secreta de Google Cloud Console
   - **TTL del token**: 1 hora (recomendado)

### 3. Actualizar Configuración de la Aplicación

1. **Actualizar archivo .env**:
   ```env
   # Reemplazar con la nueva clave pública de reCAPTCHA Enterprise
   VITE_RECAPTCHA_SITE_KEY=NUEVA_CLAVE_PUBLICA_AQUI
   ```

2. **Actualizar archivo .env.production**:
   ```env
   # Reemplazar con la nueva clave pública de reCAPTCHA Enterprise
   VITE_RECAPTCHA_SITE_KEY=NUEVA_CLAVE_PUBLICA_AQUI
   ```

### 4. Verificar Configuración

1. **Verificar dominios autorizados**:
   - En reCAPTCHA Enterprise Console
   - Asegurar que incluye:
     - `soygay-b9bc5.web.app`
     - `soygay-b9bc5.firebaseapp.com`

2. **Verificar Firebase Authentication**:
   - Ir a Firebase Console > Authentication > Settings
   - En "Dominios autorizados" agregar:
     - `soygay-b9bc5.web.app`
     - `soygay-b9bc5.firebaseapp.com`

### 5. Redesplegar Aplicación

```bash
# Reconstruir y redesplegar
npm run build
firebase deploy --only hosting
```

## 🔍 VERIFICACIÓN

### Comandos para verificar configuración:

```bash
# Verificar servicios habilitados
gcloud services list --enabled --project=soygay-b9bc5 | grep recaptcha

# Listar claves reCAPTCHA
gcloud recaptcha keys list --project=soygay-b9bc5

# Verificar configuración de Firebase
firebase projects:list
```

### Verificar en el navegador:
1. Abrir Developer Tools (F12)
2. Ir a la pestaña Console
3. Buscar mensajes de App Check
4. NO debe aparecer errores de reCAPTCHA

## 🚨 NOTAS IMPORTANTES

1. **Claves diferentes para desarrollo y producción**:
   - Desarrollo: Usar debug tokens
   - Producción: Usar claves reales de reCAPTCHA Enterprise

2. **Dominios deben coincidir exactamente**:
   - Firebase Hosting domains
   - reCAPTCHA Enterprise domains
   - Firebase Authentication authorized domains

3. **Tiempo de propagación**:
   - Los cambios pueden tardar hasta 10 minutos en propagarse
   - Limpiar caché del navegador después de cambios

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] reCAPTCHA Enterprise API habilitada
- [ ] Nueva clave de sitio web creada
- [ ] Dominios correctamente configurados
- [ ] Firebase App Check configurado
- [ ] Variables de entorno actualizadas
- [ ] Aplicación reconstruida y desplegada
- [ ] Verificación en navegador sin errores

## 🔗 ENLACES ÚTILES

- [Google Cloud Console - reCAPTCHA](https://console.cloud.google.com/security/recaptcha)
- [Firebase Console - App Check](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)
- [Documentación Firebase App Check](https://firebase.google.com/docs/app-check)
- [Documentación reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise/docs)