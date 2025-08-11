# Script de Configuración Automatizada para App Check iOS
# Proyecto: Tingay (soygay-b9bc5)
# Versión: 1.0 - PowerShell
# Uso: .\setup-ios-appcheck.ps1

param(
    [string]$BundleId,
    [string]$TeamId,
    [string]$XcodeProjectPath
)

# Configuración de colores para output
$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Red" = "Red"
        "Green" = "Green"
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "White" = "White"
        "Cyan" = "Cyan"
    }
    
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Blue"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Header {
    param([string]$Message)
    Write-ColorOutput "" "Blue"
    Write-ColorOutput "================================================" "Blue"
    Write-ColorOutput "  $Message" "Blue"
    Write-ColorOutput "================================================" "Blue"
    Write-ColorOutput "" "Blue"
}

# Verificar dependencias
function Test-Dependencies {
    Write-Header "Verificando Dependencias"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js encontrado: $nodeVersion"
    }
    catch {
        Write-Error "Node.js no está instalado. Descárgalo desde https://nodejs.org/"
        exit 1
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Success "npm encontrado: $npmVersion"
    }
    catch {
        Write-Error "npm no está disponible"
        exit 1
    }
    
    # Verificar/Instalar Firebase CLI
    try {
        $firebaseVersion = firebase --version
        Write-Success "Firebase CLI encontrado: $firebaseVersion"
    }
    catch {
        Write-Warning "Firebase CLI no encontrado. Instalando..."
        npm install -g firebase-tools
        Write-Success "Firebase CLI instalado"
    }
    
    # Verificar Git
    try {
        $gitVersion = git --version
        Write-Success "Git encontrado: $gitVersion"
    }
    catch {
        Write-Warning "Git no encontrado. Recomendado para control de versiones."
    }
}

# Solicitar información del proyecto
function Get-ProjectInfo {
    Write-Header "Configuración del Proyecto iOS"
    
    if (-not $script:BundleId) {
        $script:BundleId = Read-Host "📱 Ingresa el Bundle ID de tu app iOS (ej: com.tuempresa.tingay)"
    }
    
    if (-not $script:TeamId) {
        $script:TeamId = Read-Host "🏢 Ingresa tu Apple Team ID"
    }
    
    if (-not $script:XcodeProjectPath) {
        $script:XcodeProjectPath = Read-Host "📁 Ingresa la ruta a tu proyecto Xcode (.xcodeproj)"
    }
    
    if (-not $script:BundleId -or -not $script:TeamId -or -not $script:XcodeProjectPath) {
        Write-Error "Todos los campos son requeridos."
        exit 1
    }
    
    Write-Info "Bundle ID: $($script:BundleId)"
    Write-Info "Team ID: $($script:TeamId)"
    Write-Info "Proyecto Xcode: $($script:XcodeProjectPath)"
}

# Crear Podfile
function New-Podfile {
    Write-Header "Configurando Podfile"
    
    $projectDir = Split-Path $script:XcodeProjectPath -Parent
    $podfilePath = Join-Path $projectDir "Podfile"
    $targetName = [System.IO.Path]::GetFileNameWithoutExtension($script:XcodeProjectPath)
    
    if (-not (Test-Path $podfilePath)) {
        Write-Info "Creando Podfile..."
        
        $podfileContent = @"
# Podfile para App Check iOS
platform :ios, '11.0'
use_frameworks!

target '$targetName' do
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
"@
        
        $podfileContent | Out-File -FilePath $podfilePath -Encoding UTF8
        Write-Success "Podfile creado: $podfilePath"
    }
    else {
        Write-Warning "Podfile ya existe. Verifica que incluya FirebaseAppCheck."
    }
}

# Crear archivos de configuración
function New-ConfigFiles {
    Write-Header "Creando Archivos de Configuración"
    
    $projectDir = Split-Path $script:XcodeProjectPath -Parent
    $targetName = [System.IO.Path]::GetFileNameWithoutExtension($script:XcodeProjectPath)
    
    # Crear archivo de entitlements
    $entitlementsPath = Join-Path $projectDir "$targetName\$targetName.entitlements"
    $entitlementsDir = Split-Path $entitlementsPath -Parent
    
    if (-not (Test-Path $entitlementsDir)) {
        New-Item -ItemType Directory -Path $entitlementsDir -Force | Out-Null
    }
    
    if (-not (Test-Path $entitlementsPath)) {
        Write-Info "Creando archivo de entitlements..."
        
        $entitlementsContent = @'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.devicecheck.appattest-environment</key>
    <string>production</string>
</dict>
</plist>
'@
        
        $entitlementsContent | Out-File -FilePath $entitlementsPath -Encoding UTF8
        Write-Success "Archivo de entitlements creado: $entitlementsPath"
    }
    else {
        Write-Warning "Archivo de entitlements ya existe"
    }
    
    # Crear AppCheckProviderFactory.swift
    $factoryPath = Join-Path $projectDir "$targetName\AppCheckProviderFactory.swift"
    
    if (-not (Test-Path $factoryPath)) {
        Write-Info "Creando AppCheckProviderFactory.swift..."
        
        $factoryContent = @'
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
'@
        
        $factoryContent | Out-File -FilePath $factoryPath -Encoding UTF8
        Write-Success "AppCheckProviderFactory.swift creado: $factoryPath"
    }
    else {
        Write-Warning "AppCheckProviderFactory.swift ya existe"
    }
    
    # Crear ejemplo de AppDelegate
    $appDelegateExamplePath = Join-Path $projectDir "$targetName\AppDelegate+AppCheck.swift"
    
    if (-not (Test-Path $appDelegateExamplePath)) {
        Write-Info "Creando ejemplo de configuración para AppDelegate..."
        
        $appDelegateContent = @'
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
'@
        
        $appDelegateContent | Out-File -FilePath $appDelegateExamplePath -Encoding UTF8
        Write-Success "Ejemplo de AppDelegate creado: $appDelegateExamplePath"
    }
    else {
        Write-Warning "Ejemplo de AppDelegate ya existe"
    }
}

# Configurar Firebase
function Set-FirebaseConfig {
    Write-Header "Configuración de Firebase"
    
    Write-Info "Verificando autenticación de Firebase..."
    
    try {
        $currentProject = firebase use
        Write-Info "Proyecto actual: $currentProject"
    }
    catch {
        Write-Info "Iniciando sesión en Firebase..."
        firebase login
    }
    
    Write-Info "Configurando proyecto Firebase..."
    firebase use soygay-b9bc5
    
    Write-Warning "IMPORTANTE: Debes completar estos pasos manualmente:"
    Write-ColorOutput "1. Ve a https://console.firebase.google.com/project/soygay-b9bc5/appcheck" "Cyan"
    Write-ColorOutput "2. Haz clic en 'Add app' y selecciona 'iOS'" "Cyan"
    Write-ColorOutput "3. Ingresa tu Bundle ID: $($script:BundleId)" "Cyan"
    Write-ColorOutput "4. Selecciona 'App Attest' como proveedor" "Cyan"
    Write-ColorOutput "5. Configura TTL: 1 hora (recomendado)" "Cyan"
    Write-ColorOutput "6. Descarga GoogleService-Info.plist y agrégalo a tu proyecto Xcode" "Cyan"
    Write-ColorOutput "7. Genera un debug token para desarrollo" "Cyan"
    
    Read-Host "Presiona Enter cuando hayas completado estos pasos..."
}

# Generar resumen de configuración
function Show-Summary {
    Write-Header "Resumen de Configuración"
    
    $projectDir = Split-Path $script:XcodeProjectPath -Parent
    $targetName = [System.IO.Path]::GetFileNameWithoutExtension($script:XcodeProjectPath)
    
    Write-ColorOutput "📱 Proyecto iOS: $targetName" "White"
    Write-ColorOutput "📦 Bundle ID: $($script:BundleId)" "White"
    Write-ColorOutput "🏢 Team ID: $($script:TeamId)" "White"
    Write-ColorOutput "📁 Directorio: $projectDir" "White"
    Write-ColorOutput "" "White"
    Write-ColorOutput "📄 Archivos creados:" "Green"
    Write-ColorOutput "   - Podfile" "Green"
    Write-ColorOutput "   - $targetName.entitlements" "Green"
    Write-ColorOutput "   - AppCheckProviderFactory.swift" "Green"
    Write-ColorOutput "   - AppDelegate+AppCheck.swift (ejemplo)" "Green"
    Write-ColorOutput "" "White"
    Write-ColorOutput "🔧 Próximos pasos:" "Yellow"
    Write-ColorOutput "1. Abre $targetName.xcworkspace (NO .xcodeproj)" "Yellow"
    Write-ColorOutput "2. Agrega GoogleService-Info.plist al proyecto" "Yellow"
    Write-ColorOutput "3. Configura el archivo de entitlements en Build Settings" "Yellow"
    Write-ColorOutput "4. Integra el código de AppDelegate+AppCheck.swift en tu AppDelegate" "Yellow"
    Write-ColorOutput "5. Agrega App Attest capability en Signing & Capabilities" "Yellow"
    Write-ColorOutput "6. Compila y prueba en un dispositivo real con iOS 14+" "Yellow"
    Write-ColorOutput "" "White"
    Write-ColorOutput "📚 Documentación completa en:" "Blue"
    Write-ColorOutput "   - IOS_APP_CHECK_SETUP.md" "Blue"
    Write-ColorOutput "   - IOS_TOKENS_CONFIG.md" "Blue"
}

# Crear archivo de comandos útiles
function New-UtilityScript {
    Write-Header "Creando Scripts de Utilidad"
    
    $projectDir = Split-Path $script:XcodeProjectPath -Parent
    $utilityScriptPath = Join-Path $projectDir "ios-appcheck-utils.ps1"
    
    $utilityContent = @"
# Utilidades para App Check iOS
# Proyecto: Tingay (soygay-b9bc5)

param(
    [string]`$Action
)

function Test-AppCheckBackend {
    Write-Host "🧪 Probando conectividad con backend..." -ForegroundColor Blue
    
    `$testUrl = "https://soygay-b9bc5.web.app/api/test-app-check"
    `$localUrl = "http://localhost:3001/api/test-app-check"
    
    # Probar producción
    try {
        `$response = Invoke-RestMethod -Uri `$testUrl -Method POST -ContentType "application/json" -Body '{"test": "connectivity", "platform": "web"}'
        Write-Host "✅ Conexión a producción exitosa" -ForegroundColor Green
        Write-Host "📄 Response: `$(`$response | ConvertTo-Json)" -ForegroundColor White
    }
    catch {
        Write-Host "❌ Error conectando a producción: `$(`$_.Exception.Message)" -ForegroundColor Red
    }
    
    # Probar local
    try {
        `$response = Invoke-RestMethod -Uri `$localUrl -Method POST -ContentType "application/json" -Body '{"test": "connectivity", "platform": "web"}'
        Write-Host "✅ Conexión local exitosa" -ForegroundColor Green
        Write-Host "📄 Response: `$(`$response | ConvertTo-Json)" -ForegroundColor White
    }
    catch {
        Write-Host "❌ Error conectando localmente: `$(`$_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Asegúrate de que el servidor local esté corriendo (npm run dev)" -ForegroundColor Yellow
    }
}

function Show-FirebaseInfo {
    Write-Host "🔥 Información de Firebase" -ForegroundColor Blue
    
    try {
        `$project = firebase use
        Write-Host "📦 Proyecto actual: `$project" -ForegroundColor White
        
        Write-Host "🔗 Enlaces útiles:" -ForegroundColor Yellow
        Write-Host "   - Console: https://console.firebase.google.com/project/soygay-b9bc5/overview" -ForegroundColor Cyan
        Write-Host "   - App Check: https://console.firebase.google.com/project/soygay-b9bc5/appcheck" -ForegroundColor Cyan
        Write-Host "   - Authentication: https://console.firebase.google.com/project/soygay-b9bc5/authentication" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Error obteniendo información de Firebase" -ForegroundColor Red
        Write-Host "💡 Ejecuta 'firebase login' para autenticarte" -ForegroundColor Yellow
    }
}

function Show-ProjectInfo {
    Write-Host "📱 Información del Proyecto" -ForegroundColor Blue
    
    Write-Host "📦 Bundle ID: $($script:BundleId)" -ForegroundColor White
    Write-Host "🏢 Team ID: $($script:TeamId)" -ForegroundColor White
    Write-Host "📁 Proyecto: $($script:XcodeProjectPath)" -ForegroundColor White
    
    Write-Host "" -ForegroundColor White
    Write-Host "📋 Checklist de configuración:" -ForegroundColor Yellow
    Write-Host "   □ App registrada en Firebase Console" -ForegroundColor White
    Write-Host "   □ GoogleService-Info.plist agregado al proyecto" -ForegroundColor White
    Write-Host "   □ App Attest capability habilitada" -ForegroundColor White
    Write-Host "   □ Entitlements configurados" -ForegroundColor White
    Write-Host "   □ Código de AppDelegate integrado" -ForegroundColor White
    Write-Host "   □ Probado en dispositivo real" -ForegroundColor White
}

function Show-Help {
    Write-Host "📚 Comandos disponibles:" -ForegroundColor Blue
    Write-Host "   .\ios-appcheck-utils.ps1 test     - Probar conectividad con backend" -ForegroundColor White
    Write-Host "   .\ios-appcheck-utils.ps1 firebase - Mostrar información de Firebase" -ForegroundColor White
    Write-Host "   .\ios-appcheck-utils.ps1 info     - Mostrar información del proyecto" -ForegroundColor White
    Write-Host "   .\ios-appcheck-utils.ps1 help     - Mostrar esta ayuda" -ForegroundColor White
}

# Ejecutar acción
switch (`$Action.ToLower()) {
    "test" { Test-AppCheckBackend }
    "firebase" { Show-FirebaseInfo }
    "info" { Show-ProjectInfo }
    "help" { Show-Help }
    default { 
        Write-Host "❓ Acción no reconocida: `$Action" -ForegroundColor Red
        Show-Help 
    }
}
"@
    
    $utilityContent | Out-File -FilePath $utilityScriptPath -Encoding UTF8
    Write-Success "Script de utilidades creado: $utilityScriptPath"
}

# Función principal
function Main {
    Write-Header "Configuración Automatizada de App Check para iOS"
    Write-Info "Proyecto: Tingay (soygay-b9bc5)"
    Write-Info "Plataforma: Windows PowerShell"
    Write-ColorOutput "" "White"
    
    try {
        Test-Dependencies
        Get-ProjectInfo
        New-Podfile
        New-ConfigFiles
        Set-FirebaseConfig
        New-UtilityScript
        Show-Summary
        
        Write-Success "¡Configuración completada exitosamente!"
        Write-Info "Revisa la documentación completa en IOS_APP_CHECK_SETUP.md"
        Write-Info "Usa ios-appcheck-utils.ps1 para comandos de utilidad"
    }
    catch {
        Write-Error "Error durante la configuración: $($_.Exception.Message)"
        Write-Info "Revisa los logs y la documentación para resolver el problema"
        exit 1
    }
}

# Ejecutar script principal
if ($MyInvocation.InvocationName -ne '.') {
    Main
}