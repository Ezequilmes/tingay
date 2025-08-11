# Configuración de Firebase Authentication

Para resolver el error 400 Bad Request en Firebase Authentication, necesitas habilitar la autenticación en la consola de Firebase:

## Pasos para habilitar Firebase Authentication:

1. **Ir a la consola de Firebase:**
   - Visita: https://console.firebase.google.com/project/soygay-b9bc5/overview

2. **Navegar a Authentication:**
   - En el menú lateral izquierdo, haz clic en "Authentication"
   - Si es la primera vez, haz clic en "Get started"

3. **Habilitar métodos de inicio de sesión:**
   - Ve a la pestaña "Sign-in method"
   - Habilita "Email/Password":
     - Haz clic en "Email/Password"
     - Activa "Enable"
     - Haz clic en "Save"

4. **Configurar dominios autorizados:**
   - En la misma pestaña "Sign-in method"
   - Desplázate hacia abajo hasta "Authorized domains"
   - Asegúrate de que estos dominios estén agregados:
     - `localhost` (para desarrollo local)
     - `soygay-b9bc5.web.app` (para producción)
     - `soygay-b9bc5.firebaseapp.com` (dominio alternativo)

5. **Verificar configuración:**
   - Una vez habilitado, la aplicación debería funcionar correctamente
   - Tanto en desarrollo (localhost:5173) como en producción (soygay-b9bc5.web.app)

## URLs importantes:
- **Consola del proyecto:** https://console.firebase.google.com/project/soygay-b9bc5/overview
- **Authentication:** https://console.firebase.google.com/project/soygay-b9bc5/authentication
- **Aplicación en producción:** https://soygay-b9bc5.web.app

## Nota:
Este es un paso manual que debe realizarse una sola vez en la consola de Firebase. Una vez configurado, la autenticación funcionará tanto en desarrollo como en producción.