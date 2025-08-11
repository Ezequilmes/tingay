#!/bin/bash

# Script de Configuración Automatizada para App Check iOS
# Proyecto: Tingay (soygay-b9bc5)
# Versión: 1.0

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "  $1"
    echo "================================================"
    echo -e "${NC}"
}

# Verificar dependencias
check_dependencies() {
    print_header "Verificando Dependencias"
    
    # Verificar si estamos en macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "Este script está diseñado para macOS. Para Windows, usa PowerShell."
        exit 1
    fi
    
    # Verificar Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode no está instalado. Instala Xcode desde App Store."
        exit 1
    fi
    print_success "Xcode encontrado"
    
    # Verificar CocoaPods
    if ! command -v pod &> /dev/null; then
        print_warning "CocoaPods no encontrado. Instalando..."
        sudo gem install cocoapods
    fi
    print_success "CocoaPods disponible"
    
    # Verificar Firebase CLI
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI no encontrado. Instalando..."
        npm install -g firebase-tools
    fi
    print_success "Firebase CLI disponible"
}

# Configurar proyecto iOS
setup_ios_project() {
    print_header "Configuración del Proyecto iOS"
    
    # Solicitar información del proyecto
    read -p "📱 Ingresa el Bundle ID de tu app iOS (ej: com.tuempresa.tingay): " BUNDLE_ID
    read -p "🏢 Ingresa tu Apple Team ID: " TEAM_ID
    read -p "📁 Ingresa la ruta a tu proyecto Xcode (.xcodeproj): " XCODE_PROJECT_PATH
    
    if [[ -z "$BUNDLE_ID" || -z "$TEAM_ID" || -z "$XCODE_PROJECT_PATH" ]]; then
        print_error "Todos los campos son requeridos."
        exit 1
    fi
    
    print_info "Bundle ID: $BUNDLE_ID"
    print_info "Team ID: $TEAM_ID"
    print_info "Proyecto Xcode: $XCODE_PROJECT_PATH"
}

# Crear Podfile si no existe
create_podfile() {
    print_header "Configurando Podfile"
    
    PROJECT_DIR=$(dirname "$XCODE_PROJECT_PATH")
    PODFILE_PATH="$PROJECT_DIR/Podfile"
    
    if [[ ! -f "$PODFILE_PATH" ]]; then
        print_info "Creando Podfile..."
        
        cat > "$PODFILE_PATH" << EOF
# Podfile para App Check iOS
platform :ios, '11.0'
use_frameworks!

target '$(basename "$XCODE_PROJECT_PATH" .xcodeproj)' do
  # Firebase Core
  pod 'Firebase/Core'
  
  # Firebase App Check
  pod 'FirebaseAppCheck'
  
  # Otras dependencias de Firebase
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Storage'
  pod 'Firebase/Functions'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '11.0'
    end
  end
end
EOF
        print_success "Podfile creado"
    else
        print_warning "Podfile ya existe. Verifica que incluya FirebaseAppCheck."
    fi
}

# Instalar pods
install_pods() {
    print_header "Instalando Dependencias"
    
    PROJECT_DIR=$(dirname "$XCODE_PROJECT_PATH")
    cd "$PROJECT_DIR"
    
    print_info "Instalando pods..."
    pod install --repo-update
    
    print_success "Pods instalados exitosamente"
}

# Crear archivos de configuración
create_config_files() {
    print_header "Creando Archivos de Configuración"
    
    PROJECT_DIR=$(dirname "$XCODE_PROJECT_PATH")
    TARGET_NAME=$(basename "$XCODE_PROJECT_PATH" .xcodeproj)
    
    # Crear archivo de entitlements
    ENTITLEMENTS_PATH="$PROJECT_DIR/$TARGET_NAME/$TARGET_NAME.entitlements"
    
    if [[ ! -f "$ENTITLEMENTS_PATH" ]]; then
        print_info "Creando archivo de entitlements..."
        
        cat > "$ENTITLEMENTS_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
</dict>
</plist>
EOF
        print_success "Archivo de entitlements creado: $ENTITLEMENTS_PATH"
    else
        print_warning "Archivo de entitlements ya existe"
    fi
    
    # Crear AppCheckProviderFactory.swift
    FACTORY_PATH="$PROJECT_DIR/$TARGET_NAME/AppCheckProviderFactory.swift"
    
    if [[ ! -f "$FACTORY_PATH" ]]; then
        print_info "Creando AppCheckProviderFactory.swift..."
        
        cat > "$FACTORY_PATH" << 'EOF'
//
//  AppCheckProviderFactory.swift
//  Tingay
//
//  Generado automáticamente para App Check
//

import Foundation
import Firebase
import FirebaseAppCheck

class AppCheckProviderFactory: NSObject, AppCheckProviderFactory {
    func createProvider(with app: FirebaseApp) -> AppCheckProvider? {
        #if DEBUG
        // Usar Debug Provider en desarrollo
        return AppCheckDebugProviderFactory.shared().createProvider(with: app)
        #else
        if #available(iOS 14.0, *) {
            // Usar App Attest para iOS 14+ en producción
            return AppAttestProvider(app: app)
        } else {
            // Fallback a DeviceCheck para versiones anteriores
            return DeviceCheckProvider(app: app)
        }
        #endif
    }
}

// Extensión para configuración de debug
extension AppCheckProviderFactory {
    static func configureDebugToken() {
        #if DEBUG
        // Configura tu debug token aquí
        // let debugToken = "TU_DEBUG_TOKEN_AQUI"
        // AppCheckDebugProviderFactory.shared().setDebugToken(debugToken, for: FirebaseApp.app()!)
        print("🔧 App Check configurado en modo DEBUG")
        #endif
    }
}
EOF
        print_success "AppCheckProviderFactory.swift creado: $FACTORY_PATH"
    else
        print_warning "AppCheckProviderFactory.swift ya existe"
    fi
    
    # Crear ejemplo de AppDelegate
    APPDELEGATE_EXAMPLE_PATH="$PROJECT_DIR/$TARGET_NAME/AppDelegate+AppCheck.swift"
    
    if [[ ! -f "$APPDELEGATE_EXAMPLE_PATH" ]]; then
        print_info "Creando ejemplo de configuración para AppDelegate..."
        
        cat > "$APPDELEGATE_EXAMPLE_PATH" << 'EOF'
//
//  AppDelegate+AppCheck.swift
//  Tingay
//
//  Ejemplo de configuración de App Check en AppDelegate
//  IMPORTANTE: Integra este código en tu AppDelegate existente
//

import UIKit
import Firebase
import FirebaseAppCheck

// MARK: - Ejemplo de configuración en AppDelegate
/*

Agrega este código a tu AppDelegate existente:

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // IMPORTANTE: Configurar App Check ANTES de Firebase.configure()
        let providerFactory = AppCheckProviderFactory()
        AppCheck.setAppCheckProviderFactory(providerFactory)
        
        // Configurar debug token si es necesario
        AppCheckProviderFactory.configureDebugToken()
        
        // Configurar Firebase
        FirebaseApp.configure()
        
        // Resto de tu configuración...
        
        return true
    }
}

*/

// MARK: - Funciones de utilidad para App Check
extension AppDelegate {
    
    /// Obtiene un token de App Check manualmente
    func getAppCheckToken(completion: @escaping (String?, Error?) -> Void) {
        AppCheck.appCheck().token(forcingRefresh: false) { token, error in
            if let error = error {
                print("❌ Error obteniendo App Check token: \(error)")
                completion(nil, error)
                return
            }
            
            if let token = token {
                print("✅ App Check token obtenido exitosamente")
                completion(token.token, nil)
            } else {
                print("❌ Token es nil")
                completion(nil, NSError(domain: "AppCheck", code: -1, userInfo: [NSLocalizedDescriptionKey: "Token is nil"]))
            }
        }
    }
    
    /// Prueba la conectividad con el backend
    func testBackendConnectivity() {
        getAppCheckToken { [weak self] token, error in
            guard let token = token else {
                print("❌ No se pudo obtener token para prueba")
                return
            }
            
            self?.callBackendWithToken(token)
        }
    }
    
    private func callBackendWithToken(_ token: String) {
        guard let url = URL(string: "https://soygay-b9bc5.web.app/api/test-app-check") else {
            print("❌ URL inválida")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(token, forHTTPHeaderField: "X-Firebase-AppCheck")
        
        let body = ["test": "app-check-verification", "platform": "ios"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
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
                    
                    if httpResponse.statusCode == 200 {
                        print("✅ App Check verificado exitosamente con el backend")
                    } else {
                        print("❌ Error en verificación de App Check")
                    }
                }
            }
        }.resume()
    }
}
EOF
        print_success "Ejemplo de AppDelegate creado: $APPDELEGATE_EXAMPLE_PATH"
    else
        print_warning "Ejemplo de AppDelegate ya existe"
    fi
}

# Configurar Firebase
setup_firebase() {
    print_header "Configuración de Firebase"
    
    print_info "Iniciando sesión en Firebase..."
    firebase login
    
    print_info "Configurando proyecto Firebase..."
    firebase use soygay-b9bc5
    
    print_warning "IMPORTANTE: Debes completar estos pasos manualmente:"
    echo "1. Ve a https://console.firebase.google.com/project/soygay-b9bc5/appcheck"
    echo "2. Haz clic en 'Add app' y selecciona 'iOS'"
    echo "3. Ingresa tu Bundle ID: $BUNDLE_ID"
    echo "4. Selecciona 'App Attest' como proveedor"
    echo "5. Configura TTL: 1 hora (recomendado)"
    echo "6. Descarga GoogleService-Info.plist y agrégalo a tu proyecto Xcode"
    echo "7. Genera un debug token para desarrollo"
    
    read -p "Presiona Enter cuando hayas completado estos pasos..."
}

# Generar resumen de configuración
generate_summary() {
    print_header "Resumen de Configuración"
    
    PROJECT_DIR=$(dirname "$XCODE_PROJECT_PATH")
    TARGET_NAME=$(basename "$XCODE_PROJECT_PATH" .xcodeproj)
    
    echo "📱 Proyecto iOS: $TARGET_NAME"
    echo "📦 Bundle ID: $BUNDLE_ID"
    echo "🏢 Team ID: $TEAM_ID"
    echo "📁 Directorio: $PROJECT_DIR"
    echo ""
    echo "📄 Archivos creados:"
    echo "   - Podfile"
    echo "   - $TARGET_NAME.entitlements"
    echo "   - AppCheckProviderFactory.swift"
    echo "   - AppDelegate+AppCheck.swift (ejemplo)"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "1. Abre $TARGET_NAME.xcworkspace (NO .xcodeproj)"
    echo "2. Agrega GoogleService-Info.plist al proyecto"
    echo "3. Configura el archivo de entitlements en Build Settings"
    echo "4. Integra el código de AppDelegate+AppCheck.swift en tu AppDelegate"
    echo "5. Agrega App Attest capability en Signing & Capabilities"
    echo "6. Compila y prueba en un dispositivo real con iOS 14+"
    echo ""
    echo "📚 Documentación completa en:"
    echo "   - IOS_APP_CHECK_SETUP.md"
    echo "   - IOS_TOKENS_CONFIG.md"
}

# Función principal
main() {
    print_header "Configuración Automatizada de App Check para iOS"
    print_info "Proyecto: Tingay (soygay-b9bc5)"
    echo ""
    
    check_dependencies
    setup_ios_project
    create_podfile
    install_pods
    create_config_files
    setup_firebase
    generate_summary
    
    print_success "¡Configuración completada!"
    print_info "Revisa la documentación completa en IOS_APP_CHECK_SETUP.md"
}

# Ejecutar script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi