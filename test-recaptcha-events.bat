@echo off
echo ========================================
echo    PRUEBAS DE reCAPTCHA ENTERPRISE
echo         Aplicacion Tingay
echo ========================================
echo.
echo Este script abrira las herramientas de prueba de reCAPTCHA Enterprise
echo para verificar que el frontend y backend esten configurados correctamente.
echo.
echo Configuracion actual:
echo - Proyecto: soygay-b9bc5
echo - Site Key: 6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI
echo - Dominio: localhost (desarrollo)
echo.
echo ========================================
echo.

REM Verificar si el servidor de desarrollo esta corriendo
echo Verificando si el servidor de desarrollo esta activo...
netstat -an | findstr ":5173" >nul
if %errorlevel% == 0 (
    echo ✅ Servidor de desarrollo detectado en puerto 5173
    set SERVER_RUNNING=true
) else (
    echo ⚠️  Servidor de desarrollo no detectado
    set SERVER_RUNNING=false
)

echo.
echo Opciones disponibles:
echo.
echo 1. Abrir pagina de prueba independiente (HTML)
echo 2. Abrir aplicacion principal con herramientas de prueba
echo 3. Iniciar servidor de desarrollo y abrir pruebas
echo 4. Ver documentacion de configuracion
echo 5. Ejecutar prueba de API con curl
echo 6. Salir
echo.
set /p choice=Selecciona una opcion (1-6): 

if "%choice%"=="1" goto :open_test_page
if "%choice%"=="2" goto :open_main_app
if "%choice%"=="3" goto :start_dev_server
if "%choice%"=="4" goto :open_docs
if "%choice%"=="5" goto :test_api
if "%choice%"=="6" goto :exit

echo Opcion invalida. Intenta de nuevo.
pause
goto :start

:open_test_page
echo.
echo 🌐 Abriendo pagina de prueba independiente...
echo Esta pagina contiene herramientas completas para probar reCAPTCHA Enterprise
echo.
start "" "test-recaptcha-event.html"
echo ✅ Pagina abierta en el navegador predeterminado
echo.
echo 📋 Instrucciones:
echo 1. La pagina cargara automaticamente reCAPTCHA Enterprise
echo 2. Usa los botones para probar diferentes acciones
echo 3. Revisa el log de eventos para ver los resultados
echo 4. Verifica que no haya errores en la consola del navegador (F12)
echo.
goto :end

:open_main_app
if "%SERVER_RUNNING%"=="false" (
    echo ❌ El servidor de desarrollo no esta corriendo
    echo Usa la opcion 3 para iniciarlo automaticamente
    pause
    goto :start
)

echo.
echo 🌐 Abriendo aplicacion principal con herramientas de prueba...
echo.
start "" "http://localhost:5173"
echo ✅ Aplicacion abierta en http://localhost:5173
echo.
echo 📋 Instrucciones para probar en la aplicacion:
echo 1. Abre las herramientas de desarrollador (F12)
echo 2. Ve a la pestaña Console
echo 3. Ejecuta: testRecaptcha.runAll()
echo 4. Observa los resultados de las pruebas
echo.
echo 🔧 Comandos disponibles en la consola:
echo - testRecaptcha.runAll() - Ejecutar todas las pruebas
echo - testRecaptcha.test("LOGIN") - Probar accion especifica
echo - testRecaptcha.getResults() - Ver ultimos resultados
echo.
goto :end

:start_dev_server
echo.
echo 🚀 Iniciando servidor de desarrollo...
echo.
echo Esto puede tomar unos momentos...
start "Servidor Tingay" cmd /k "npm run dev"
echo.
echo ⏳ Esperando a que el servidor se inicie...
timeout /t 10 /nobreak >nul
echo.
echo 🌐 Abriendo aplicacion con herramientas de prueba...
start "" "http://localhost:5173"
echo.
echo ✅ Servidor iniciado y aplicacion abierta
echo.
echo 📋 Para probar reCAPTCHA:
echo 1. Abre herramientas de desarrollador (F12)
echo 2. Ve a Console
echo 3. Ejecuta: testRecaptcha.runAll()
echo.
goto :end

:open_docs
echo.
echo 📚 Abriendo documentacion de configuracion...
echo.
if exist "RECAPTCHA_ENTERPRISE_SETUP.md" (
    start "" "RECAPTCHA_ENTERPRISE_SETUP.md"
    echo ✅ Documentacion abierta
) else (
    echo ❌ Archivo de documentacion no encontrado
)
echo.
if exist "FIREBASE_APP_CHECK_SETUP.md" (
    start "" "FIREBASE_APP_CHECK_SETUP.md"
    echo ✅ Guia de App Check abierta
) else (
    echo ⚠️  Guia de App Check no encontrada
)
echo.
goto :end

:test_api
echo.
echo 🧪 Ejecutando prueba de API de reCAPTCHA Enterprise...
echo.
echo ⚠️  NOTA: Esta prueba requiere un token valido de reCAPTCHA
echo Para obtener un token real, usa primero las opciones 1 o 2
echo.
echo Ejecutando con datos de ejemplo...
echo.
if exist "test-recaptcha.bat" (
    call "test-recaptcha.bat"
) else (
    echo ❌ Script de prueba de API no encontrado
    echo Creando script basico...
    echo.
    curl -X POST "https://recaptchaenterprise.googleapis.com/v1/projects/soygay-b9bc5/assessments?key=AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw" -H "Content-Type: application/json" -d @request.json
)
echo.
goto :end

:end
echo.
echo ========================================
echo.
echo 💡 CONSEJOS IMPORTANTES:
echo.
echo 1. 📊 Monitoreo: Los eventos pueden tardar unos minutos en aparecer
echo    en la pestana "Descripcion general" de reCAPTCHA Enterprise
echo.
echo 2. 🔍 Debugging: Usa las herramientas de desarrollador (F12)
echo    para ver errores detallados en la consola
echo.
echo 3. 📈 Metricas: Revisa Google Cloud Console para ver
echo    estadisticas detalladas de reCAPTCHA Enterprise
echo.
echo 4. ⚠️  Permisos: Si ves errores de permisos, verifica que:
echo    - Los dominios esten correctamente configurados
echo    - La API key tenga los permisos necesarios
echo    - Firebase App Check este habilitado
echo.
echo ========================================
echo.
echo 🔗 Enlaces utiles:
echo - Google Cloud Console: https://console.cloud.google.com/security/recaptcha
echo - Firebase Console: https://console.firebase.google.com/project/soygay-b9bc5/appcheck
echo - Documentacion: https://firebase.google.com/docs/app-check
echo.
echo ¿Deseas ejecutar otra prueba?
set /p repeat=Presiona 'S' para volver al menu o cualquier tecla para salir: 
if /i "%repeat%"=="S" goto :start

:exit
echo.
echo 👋 ¡Gracias por usar las herramientas de prueba de reCAPTCHA Enterprise!
echo.
echo 📝 Recuerda:
echo - Revisar los logs de la consola del navegador
echo - Verificar metricas en Google Cloud Console
echo - Consultar la documentacion si encuentras problemas
echo.
pause
exit /b 0