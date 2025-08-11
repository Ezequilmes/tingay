@echo off
echo ========================================
echo    DEPLOYMENT A FIREBASE HOSTING
echo ========================================
echo.

echo [1/4] Verificando Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI no encontrado. Instalando...
    npm install -g firebase-tools
    if errorlevel 1 (
        echo ❌ Error instalando Firebase CLI
        pause
        exit /b 1
    )
)
echo ✅ Firebase CLI disponible

echo.
echo [2/4] Instalando dependencias...
npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

echo.
echo [3/4] Creando build de producción...
npm run build
if errorlevel 1 (
    echo ❌ Error en el build de producción
    pause
    exit /b 1
)
echo ✅ Build de producción creado

echo.
echo [4/4] Desplegando a Firebase Hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo ❌ Error en el deployment
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo 🌐 Tu aplicación está disponible en:
echo    https://soygay-b9bc5.web.app
echo    https://soygay-b9bc5.firebaseapp.com
echo.
echo 📊 Console de Firebase:
echo    https://console.firebase.google.com/project/soygay-b9bc5
echo.
echo ⚠️  Recuerda configurar:
echo    - App Check en Firebase Console
echo    - Dominios autorizados
echo    - Permisos IAM de Storage
echo.
pause