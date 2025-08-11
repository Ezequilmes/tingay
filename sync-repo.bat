@echo off
echo ========================================
echo    SINCRONIZACION CON GITHUB
echo ========================================
echo.

echo Verificando estado del repositorio...
git status
echo.

echo Intentando sincronizar con GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SINCRONIZACION EXITOSA!
    echo ========================================
    echo.
    echo Tu codigo ha sido subido a:
    echo https://github.com/sportingwsc15-hue/tingay
    echo.
    echo Aplicacion desplegada en:
    echo https://soygay-b9bc5.web.app
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: SIN PERMISOS
    echo ========================================
    echo.
    echo Aun no tienes permisos de escritura.
    echo Opciones:
    echo 1. Esperar a que el propietario te agregue como colaborador
    echo 2. Crear tu propio repositorio
    echo 3. Hacer fork del repositorio
    echo.
    echo Para crear tu propio repositorio:
    echo 1. Ve a https://github.com/new
    echo 2. Crea un nuevo repositorio
    echo 3. Ejecuta: git remote set-url origin https://github.com/TU_USUARIO/NOMBRE_REPO.git
    echo 4. Ejecuta: git push -u origin main
    echo.
)

echo Presiona cualquier tecla para continuar...
pause >nul