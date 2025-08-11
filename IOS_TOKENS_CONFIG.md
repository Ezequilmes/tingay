# Tokens y Configuración para iOS - Proyecto Tingay

## 🔑 Información de Tokens y Configuración Actual

### Configuración del Proyecto Firebase
- **Project ID**: `soygay-b9bc5`
- **Web App**: Ya configurada con reCAPTCHA Enterprise
- **Dominio de Producción**: `https://soygay-b9bc5.web.app`
- **Dominio Local**: `http://localhost:5173`

### Configuración Actual de reCAPTCHA Enterprise
- **Site Key**: `6LfvQKEqAAAAABbvFVjKOaJvjvOLzQWzpzpzpzpz` (ejemplo)
- **API Key**: Configurada en variables de entorno
- **Dominios Autorizados**: 
  - `soygay-b9bc5.web.app`
  - `localhost`

## 📱 Pasos Específicos para Obtener Tokens iOS

### 1. Información Requerida para Registro

Para registrar tu aplicación iOS en Firebase Console, necesitarás:

```
Bundle ID: com.tuempresa.tingay (reemplaza con tu Bundle ID real)
Team ID: [Tu Apple Developer Team ID]
App Store ID: [Cuando publiques en App Store]
```

### 2. URLs de Configuración Directa

#### Firebase Console - App Check:
```
https://console.firebase.google.com/project/soygay-b9bc5/appcheck
```

#### Pasos en Firebase Console:
1. Ve al enlace anterior
2. Haz clic en "Add app" o "Agregar aplicación"
3. Selecciona "iOS"
4. Ingresa tu Bundle ID
5. Selecciona "App Attest" como proveedor
6. Configura TTL: 1 hora (recomendado)

### 3. Configuración de GoogleService-Info.plist

Después de registrar tu app iOS, descarga el archivo `GoogleService-Info.plist` y agrégalo a tu proyecto Xcode. Este archivo contendrá:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PROJECT_ID</key>
    <string>soygay-b9bc5</string>
    <key>BUNDLE_ID</key>
    <string>com.tuempresa.tingay</string>
    <key>IS_ADS_ENABLED</key>
    <false/>
    <key>IS_ANALYTICS_ENABLED</key>
    <false/>
    <key>IS_APPINVITE_ENABLED</key>
    <true/>
    <key>IS_GCM_ENABLED</key>
    <true/>
    <key>IS_SIGNIN_ENABLED</key>
    <true/>
    <key>GOOGLE_APP_ID</key>
    <string>[Se generará automáticamente]</string>
    <key>API_KEY</key>
    <string>[Se generará automáticamente]</string>
    <!-- Otros campos se generarán automáticamente -->
</dict>
</plist>
```

### 4. Tokens de Debug para Desarrollo

#### Generar Debug Token:
1. En Firebase Console → App Check → Apps
2. Encuentra tu app iOS
3. Haz clic en "Manage debug tokens"
4. Genera un nuevo token
5. Copia el token generado

#### Usar Debug Token en Código:
```swift
// En tu AppDelegate o configuración inicial
#if DEBUG
let debugToken = "[Tu Debug Token Aquí]"
AppCheckDebugProviderFactory.shared().setDebugToken(debugToken, for: FirebaseApp.app()!)
#endif
```

### 5. Configuración de Entitlements

Crea o modifica tu archivo `.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
    
    <!-- Para desarrollo, puedes usar: -->
    <!-- <string>development</string> -->
</dict>
</plist>
```

### 6. Configuración de Info.plist

Agrega estas configuraciones a tu `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>soygay-b9bc5.web.app</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

## 🔧 Configuración del Backend para iOS

### Middleware de Verificación Actualizado

Actualiza tu middleware en `middleware/auth.js` para soportar tokens de iOS:

```javascript
const { getAppCheck } = require('firebase-admin/app-check');

const verifyAppCheckToken = async (req, res, next) => {
    const appCheckToken = req.header('X-Firebase-AppCheck') || 
                         req.header('x-firebase-appcheck') ||
                         req.body.appCheckToken;
    
    if (!appCheckToken) {
        console.log('App Check token no encontrado en headers o body');
        return res.status(401).json({ 
            error: 'App Check token requerido',
            code: 'APP_CHECK_TOKEN_MISSING'
        });
    }
    
    try {
        const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
        
        console.log('App Check token verificado exitosamente:', {
            appId: appCheckClaims.app_id,
            aud: appCheckClaims.aud,
            exp: new Date(appCheckClaims.exp * 1000),
            iat: new Date(appCheckClaims.iat * 1000)
        });
        
        req.appCheckClaims = appCheckClaims;
        next();
    } catch (error) {
        console.error('Error verificando App Check token:', {
            error: error.message,
            code: error.code,
            token: appCheckToken.substring(0, 20) + '...'
        });
        
        return res.status(401).json({ 
            error: 'Token de App Check inválido',
            code: 'APP_CHECK_TOKEN_INVALID',
            details: error.message
        });
    }
};

// Middleware opcional para desarrollo
const optionalAppCheckToken = async (req, res, next) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');
    
    if (appCheckToken) {
        try {
            const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
            req.appCheckClaims = appCheckClaims;
        } catch (error) {
            console.warn('App Check token inválido (opcional):', error.message);
        }
    }
    
    next();
};

module.exports = { 
    verifyAppCheckToken, 
    optionalAppCheckToken 
};
```

### Endpoints Protegidos

Ejemplo de cómo proteger endpoints específicos:

```javascript
const express = require('express');
const { verifyAppCheckToken } = require('../middleware/auth');
const router = express.Router();

// Endpoint protegido con App Check
router.post('/secure-action', verifyAppCheckToken, async (req, res) => {
    try {
        // Lógica del endpoint
        const result = await performSecureAction(req.body);
        
        res.json({
            success: true,
            data: result,
            appCheckVerified: true,
            appId: req.appCheckClaims.app_id
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            appCheckVerified: true
        });
    }
});

module.exports = router;
```

## 📊 Testing y Validación

### 1. Verificar Token en iOS

```swift
func testAppCheckToken() {
    AppCheck.appCheck().token(forcingRefresh: true) { token, error in
        if let error = error {
            print("❌ Error obteniendo token: \(error.localizedDescription)")
            return
        }
        
        guard let token = token else {
            print("❌ Token es nil")
            return
        }
        
        print("✅ Token obtenido exitosamente:")
        print("Token: \(token.token.prefix(20))...")
        print("Expira: \(token.expirationDate)")
        
        // Probar el token con tu backend
        self.testTokenWithBackend(token.token)
    }
}

func testTokenWithBackend(_ token: String) {
    guard let url = URL(string: "https://soygay-b9bc5.web.app/api/test-app-check") else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(token, forHTTPHeaderField: "X-Firebase-AppCheck")
    
    let body = ["test": "app-check-verification"]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Error en request: \(error.localizedDescription)")
            return
        }
        
        if let httpResponse = response as? HTTPURLResponse {
            print("📡 Status Code: \(httpResponse.statusCode)")
            
            if let data = data,
               let responseString = String(data: data, encoding: .utf8) {
                print("📄 Response: \(responseString)")
            }
        }
    }.resume()
}
```

### 2. Endpoint de Testing en Backend

Agrega este endpoint para probar la verificación:

```javascript
// En tu archivo de rutas
router.post('/test-app-check', verifyAppCheckToken, (req, res) => {
    res.json({
        success: true,
        message: 'App Check token verificado exitosamente',
        appCheckClaims: {
            appId: req.appCheckClaims.app_id,
            audience: req.appCheckClaims.aud,
            expirationTime: new Date(req.appCheckClaims.exp * 1000),
            issuedAt: new Date(req.appCheckClaims.iat * 1000)
        },
        timestamp: new Date().toISOString()
    });
});
```

## 🚀 Comandos Rápidos

### Para Desarrollo:
```bash
# Instalar dependencias iOS
pod install

# Limpiar build
xcodebuild clean -workspace YourApp.xcworkspace -scheme YourApp

# Build para testing
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -destination 'platform=iOS,name=iPhone' build
```

### Para Verificar Configuración:
```bash
# Verificar que el backend esté corriendo
curl -X POST http://localhost:3001/api/test-app-check \
  -H "Content-Type: application/json" \
  -H "X-Firebase-AppCheck: test-token" \
  -d '{"test": "verification"}'
```

## 📋 Checklist de Tokens iOS

- [ ] Bundle ID definido y registrado en Apple Developer
- [ ] App registrada en Firebase Console con App Attest
- [ ] GoogleService-Info.plist descargado y agregado al proyecto
- [ ] Debug token generado para desarrollo
- [ ] Entitlements configurados correctamente
- [ ] FirebaseAppCheck agregado a dependencias
- [ ] AppCheckProviderFactory implementado
- [ ] Backend actualizado para verificar tokens iOS
- [ ] Endpoint de testing creado
- [ ] Pruebas realizadas en dispositivo real
- [ ] Enforcement habilitado en Firebase Console

## 🔗 Enlaces Directos

- [Firebase Console - Proyecto](https://console.firebase.google.com/project/soygay-b9bc5/overview)
- [App Check Configuration](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)
- [Apple Developer Console](https://developer.apple.com/account/)
- [App Store Connect](https://appstoreconnect.apple.com/)

---

**Nota**: Reemplaza `com.tuempresa.tingay` con tu Bundle ID real y actualiza los tokens de debug según sea necesario.