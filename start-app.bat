@echo off
echo Iniciando la aplicación Tingay...

REM Cambiar al directorio de la aplicación
cd /d "%~dp0"

REM Iniciar el servidor Node.js
start cmd /k "node server.js"

echo Servidor iniciado en http://localhost:3000
echo Puedes acceder a la aplicación abriendo tu navegador en http://localhost:3000

REM Abrir el navegador automáticamente después de 2 segundos
timeout /t 2 /nobreak > nul
start http://localhost:3000