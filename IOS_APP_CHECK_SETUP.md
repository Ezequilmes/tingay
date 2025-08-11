# Configuración de App Check para iOS

## 📱 Guía Completa para Activar App Check en Aplicaciones iOS

Esta guía te ayudará a configurar Firebase App Check para tu aplicación iOS usando **App Attest** como proveedor de attestación.

## 🎯 ¿Qué es App Check para iOS?

App Check para iOS utiliza **App Attest** de Apple para verificar que las solicitudes a los servicios de Firebase provienen de tu aplicación auténtica y no han sido manipuladas. <mcreference link="https://firebase.google.com/docs/app-check/ios/app-attest-provider" index="1">1</mcreference>

### Beneficios:
- **Previene abuso de API**: Evita acceso no autorizado a tus recursos de backend
- **Reduce fraude**: Detecta instancias falsas de tu aplicación
- **Mejora seguridad**: Capa adicional de protección para operaciones sensibles
- **Detecta dispositivos comprometidos**: Falla en dispositivos con jailbreak <mcreference link="https://liudasbar.medium.com/implementing-firebase-app-check-on-ios-non-firebase-back-end-df86df494c6c" index="2">2</mcreference>

## 📋 Requisitos Previos

### Versiones Mínimas:
- **Xcode**: 12.5 o superior <mcreference link="https://firebase.google.com/docs/app-check/ios/app-attest-provider" index="1">1</mcreference>
- **iOS**: 14.0 o superior (para App Attest)
- **iOS Deployment Target**: 11.0 mínimo en Podfile <mcreference link="https://rnfirebase.io/app-check/usage" index="3">3</mcreference>

### Configuración Actual del Proyecto:
- **Proyecto Firebase**: `soygay-b9bc5`
- **Bundle ID**: Necesario para registro en Firebase Console
- **Team ID**: Requerido para App Attest

## 🚀 Pasos de Configuración

### 1. Configurar Firebase Console

#### Registrar la Aplicación iOS:
1. Ve a [Firebase Console](https://console.firebase.google.com/project/soygay-b9bc5/overview)
2. Navega a **App Check** en el menú lateral
3. Haz clic en **"Add app"** o **"Agregar aplicación"**
4. Selecciona **iOS** como plataforma
5. Ingresa tu **Bundle ID** de la aplicación iOS
6. Selecciona **"App Attest"** como proveedor
7. Configura el **TTL (Time To Live)** del token:
   - **Recomendado**: 1 hora (por defecto)
   - **Rango**: 30 minutos a 7 días <mcreference link="https://firebase.google.com/docs/app-check/ios/app-attest-provider" index="1">1</mcreference>

#### Configurar Enforcement:
1. En la sección **App Check**, ve a **"Apps"**
2. Encuentra tu aplicación iOS registrada
3. Habilita **"Enforce App Check"** para los servicios que desees proteger:
   - Realtime Database
   - Cloud Firestore
   - Cloud Storage
   - Cloud Functions
   - Authentication <mcreference link="https://rnfirebase.io/app-check/usage" index="3">3</mcreference>

### 2. Configurar Xcode Project

#### Agregar Dependencias:

**Usando CocoaPods** (Podfile):
```ruby
# Versión mínima de iOS
platform :ios, '11.0'

target 'YourAppName' do
  # Firebase Core (si no está ya incluido)
  pod 'Firebase/Core'
  
  # Firebase App Check
  pod 'FirebaseAppCheck'
  
  # Otras dependencias de Firebase que uses
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Storage'
end
```

**Usando Swift Package Manager**:
1. En Xcode: **File → Add Package Dependencies**
2. URL: `https://github.com/firebase/firebase-ios-sdk`
3. Selecciona **FirebaseAppCheck** <mcreference link="https://firebase.google.com/docs/app-check/ios/app-attest-provider" index="1">1</mcreference>

#### Configurar Capabilities:
1. En Xcode, selecciona tu proyecto
2. Ve a **"Signing & Capabilities"**
3. Haz clic en **"+ Capability"**
4. Busca y agrega **"App Attest"**

#### Configurar Entitlements:
En tu archivo `.entitlements`, agrega:
```xml
<key>com.apple.developer.devicecheck.appattest-environment</key>
<string>production</string>
```

### 3. Implementar App Check en el Código

#### Swift Implementation:

**AppDelegate.swift**:
```swift
import UIKit
import Firebase
import FirebaseAppCheck

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Configurar App Check ANTES de Firebase.configure()
        let providerFactory = AppCheckProviderFactory()
        AppCheck.setAppCheckProviderFactory(providerFactory)
        
        // Configurar Firebase
        FirebaseApp.configure()
        
        return true
    }
}

// Factory para App Check Provider
class AppCheckProviderFactory: NSObject, AppCheckProviderFactory {
    func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
        if #available(iOS 14.0, *) {
            // Usar App Attest para iOS 14+
            return AppAttestProvider(app: app)
        } else {
            // Fallback a DeviceCheck para versiones anteriores
            return DeviceCheckProvider(app: app)
        }
    }
}
```

#### Objective-C Implementation:

**AppDelegate.m**:
```objc
#import "AppDelegate.h"
#import <Firebase/Firebase.h>
#import <FirebaseAppCheck/FirebaseAppCheck.h>

@interface AppCheckProviderFactory : NSObject <FIRAppCheckProviderFactory>
@end

@implementation AppCheckProviderFactory

- (nullable id<FIRAppCheckProvider>)createProviderWithApp:(nonnull FIRApp *)app {
    if (@available(iOS 14.0, *)) {
        return [[FIRAppAttestProvider alloc] initWithApp:app];
    } else {
        return [[FIRDeviceCheckProvider alloc] initWithApp:app];
    }
}

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    
    // Configurar App Check ANTES de [FIRApp configure]
    AppCheckProviderFactory *providerFactory = [[AppCheckProviderFactory alloc] init];
    [FIRAppCheck setAppCheckProviderFactory:providerFactory];
    
    // Configurar Firebase
    [FIRApp configure];
    
    return YES;
}

@end
```

### 4. Configuración para Desarrollo y Testing

#### Debug Provider (para simulador y desarrollo):

**Swift**:
```swift
class AppCheckProviderFactory: NSObject, AppCheckProviderFactory {
    func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
        #if DEBUG
        // Usar Debug Provider en desarrollo
        let settings = AppCheckDebugProviderFactory.shared()
        return settings.createProvider(with: app)
        #else
        if #available(iOS 14.0, *) {
            return AppAttestProvider(app: app)
        } else {
            return DeviceCheckProvider(app: app)
        }
        #endif
    }
}
```

#### Configurar Debug Token:
1. En Firebase Console → App Check → Apps
2. Encuentra tu app iOS
3. Haz clic en **"Manage debug tokens"**
4. Agrega un nuevo debug token
5. Usa este token en tu código de desarrollo

### 5. Obtener y Usar Tokens de App Check

#### Obtener Token Manualmente:
```swift
import FirebaseAppCheck

func getAppCheckToken() {
    AppCheck.appCheck().token(forcingRefresh: false) { token, error in
        if let error = error {
            print("Error obteniendo App Check token: \(error)")
            return
        }
        
        if let token = token {
            print("App Check Token: \(token.token)")
            // Usar el token en llamadas a tu backend
            self.callBackendWithToken(token.token)
        }
    }
}
```

#### Enviar Token al Backend:
```swift
func callBackendWithToken(_ appCheckToken: String) {
    var request = URLRequest(url: URL(string: "https://tu-backend.com/api/endpoint")!)
    request.httpMethod = "POST"
    
    // Agregar App Check token en headers
    request.setValue(appCheckToken, forHTTPHeaderField: "X-Firebase-AppCheck")
    
    // Realizar la llamada
    URLSession.shared.dataTask(with: request) { data, response, error in
        // Manejar respuesta
    }.resume()
}
```

## 🔧 Configuración del Backend

### Verificar Tokens en el Servidor:

Tu backend actual ya tiene la configuración para verificar tokens de App Check. El middleware en `middleware/auth.js` puede ser extendido para verificar tokens de App Check:

```javascript
const { getAppCheck } = require('firebase-admin/app-check');

const verifyAppCheckToken = async (req, res, next) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');
    
    if (!appCheckToken) {
        return res.status(401).json({ error: 'App Check token requerido' });
    }
    
    try {
        const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);
        // Token válido, continuar
        req.appCheckClaims = appCheckClaims;
        next();
    } catch (error) {
        console.error('Error verificando App Check token:', error);
        return res.status(401).json({ error: 'Token de App Check inválido' });
    }
};

module.exports = { verifyAppCheckToken };
```

## 🧪 Testing y Debugging

### Verificar Configuración:

1. **Logs en Xcode Console**:
   - Busca mensajes de App Check initialization
   - Verifica que no haya errores de attestación

2. **Firebase Console**:
   - Ve a App Check → Metrics
   - Verifica que se estén generando tokens
   - Revisa las métricas de verificación

3. **Network Debugging**:
   - Usa Charles Proxy o similar
   - Verifica que las requests incluyan el header `X-Firebase-AppCheck`

### Problemas Comunes:

#### Error: "App Attest is not available":
- Verifica que estés usando iOS 14+ en dispositivo real
- App Attest no funciona en simulador (usa Debug Provider)

#### Error: "App Check token verification failed":
- Verifica que el Bundle ID coincida en Firebase Console
- Asegúrate de que App Attest esté habilitado en capabilities
- Verifica que el entitlement esté configurado correctamente

#### Error: "Quota exceeded":
- App Attest tiene límites de quota
- Considera aumentar el TTL del token
- Implementa caché de tokens en tu aplicación <mcreference link="https://firebase.google.com/docs/app-check/ios/app-attest-provider" index="1">1</mcreference>

## 📊 Monitoreo y Métricas

### Firebase Console Metrics:
1. Ve a **App Check → Metrics**
2. Revisa:
   - **Token requests**: Número de solicitudes de tokens
   - **Token verifications**: Verificaciones exitosas/fallidas
   - **Error rates**: Tasas de error por tipo

### Alertas Recomendadas:
- Alta tasa de tokens rechazados
- Picos inusuales en solicitudes de tokens
- Errores de verificación en el backend

## 🔗 Enlaces Útiles

- [Documentación oficial de App Check iOS](https://firebase.google.com/docs/app-check/ios/app-attest-provider)
- [App Attest de Apple](https://developer.apple.com/documentation/devicecheck/app_attest)
- [Firebase Console - App Check](https://console.firebase.google.com/project/soygay-b9bc5/appcheck)
- [Guía de implementación personalizada](https://firebase.google.com/docs/app-check/ios/custom-provider)

## ✅ Checklist de Implementación

- [ ] Registrar app iOS en Firebase Console con App Attest
- [ ] Configurar TTL de tokens (recomendado: 1 hora)
- [ ] Agregar FirebaseAppCheck a dependencias
- [ ] Configurar App Attest capability en Xcode
- [ ] Agregar entitlement de producción
- [ ] Implementar AppCheckProviderFactory
- [ ] Inicializar App Check antes de Firebase.configure()
- [ ] Configurar Debug Provider para desarrollo
- [ ] Implementar verificación de tokens en backend
- [ ] Probar en dispositivo real con iOS 14+
- [ ] Habilitar enforcement en Firebase Console
- [ ] Configurar monitoreo y alertas

## 🚨 Notas Importantes

1. **App Attest solo funciona en dispositivos reales** con iOS 14+
2. **No funciona en simulador** - usa Debug Provider para desarrollo
3. **Requiere distribución desde App Store** para funcionar completamente en producción
4. **Tiene límites de quota** - monitorea el uso
5. **Los tokens expiran** - implementa renovación automática
6. **Puede tomar hasta 5 minutos** para que los cambios en Firebase Console se apliquen <mcreference link="https://liudasbar.medium.com/implementing-firebase-app-check-on-ios-non-firebase-back-end-df86df494c6c" index="2">2</mcreference>

---

**Proyecto**: Tingay (soygay-b9bc5)  
**Fecha**: $(date)  
**Versión**: 1.0