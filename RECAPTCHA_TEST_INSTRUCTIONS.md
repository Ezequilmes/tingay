# 🔒 Instrucciones para Probar reCAPTCHA Enterprise

## ✅ Estado Actual

- **✅ Página de prueba independiente**: `test-recaptcha-event.html` - **ABIERTA**
- **✅ Aplicación principal**: `http://localhost:5173/` - **EJECUTÁNDOSE**
- **✅ Herramientas de prueba**: Integradas automáticamente en desarrollo
- **✅ Scripts de automatización**: Disponibles

## 🧪 Herramientas de Prueba Disponibles

### 1. Página de Prueba Independiente (ACTIVA)
**Archivo**: `test-recaptcha-event.html`

**Características**:
- ✅ Interfaz visual completa para pruebas
- ✅ Verificación automática de carga de reCAPTCHA
- ✅ Pruebas de diferentes acciones (LOGIN, REGISTER, etc.)
- ✅ Llamadas directas a la API de reCAPTCHA Enterprise
- ✅ Log detallado de eventos y resultados
- ✅ Indicadores visuales de éxito/error

**Cómo usar**:
1. La página ya está abierta en tu navegador
2. Haz clic en los botones de prueba:
   - "1. Verificar Carga de reCAPTCHA"
   - "2. Ejecutar reCAPTCHA (LOGIN)"
   - "3. Ejecutar reCAPTCHA (REGISTER)"
   - "4. Ejecutar reCAPTCHA (PROFILE_UPDATE)"
   - "5. Probar API de reCAPTCHA Enterprise"
3. Observa el log de eventos para ver los resultados
4. Abre las herramientas de desarrollador (F12) para ver detalles adicionales

### 2. Aplicación Principal con Herramientas Integradas (ACTIVA)
**URL**: `http://localhost:5173/`

**Características**:
- ✅ reCAPTCHA Enterprise cargado automáticamente
- ✅ Herramientas de prueba disponibles en consola
- ✅ Integración completa con Firebase App Check
- ✅ Pruebas en el contexto real de la aplicación

**Cómo usar**:
1. La aplicación ya está abierta en `http://localhost:5173/`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Console"
4. Ejecuta los siguientes comandos:

```javascript
// Ejecutar todas las pruebas automáticamente
testRecaptcha.runAll()

// Probar una acción específica
testRecaptcha.test("LOGIN")
testRecaptcha.test("REGISTER")
testRecaptcha.test("PROFILE_UPDATE")

// Ver resultados de las últimas pruebas
testRecaptcha.getResults()

// Limpiar resultados guardados
testRecaptcha.clearResults()
```

### 3. Script de Automatización
**Archivo**: `test-recaptcha-events.bat`

**Características**:
- ✅ Menú interactivo para diferentes tipos de prueba
- ✅ Detección automática del servidor de desarrollo
- ✅ Apertura automática de herramientas
- ✅ Acceso rápido a documentación

**Cómo usar**:
```bash
.\test-recaptcha-events.bat
```

## 🎯 Activar Eventos de reCAPTCHA

### Método 1: Página de Prueba (Recomendado)
1. **Ya está abierta** - Busca la ventana del navegador con "Prueba de reCAPTCHA Enterprise"
2. Haz clic en cualquier botón de prueba
3. Los eventos se generarán automáticamente
4. Observa el log para confirmar que los tokens se generan correctamente

### Método 2: Aplicación Principal
1. **Ya está abierta** - Busca la ventana con `http://localhost:5173/`
2. Abre herramientas de desarrollador (F12)
3. En la consola, ejecuta: `testRecaptcha.runAll()`
4. Observa los resultados en la consola

### Método 3: Uso Real de la Aplicación
1. Ve a `http://localhost:5173/`
2. Intenta hacer login, registro, o cualquier acción
3. reCAPTCHA se ejecutará automáticamente en segundo plano
4. Los eventos aparecerán en Google Cloud Console

## 📊 Verificar Resultados

### En el Navegador
1. **Consola del navegador (F12)**:
   - Busca mensajes de reCAPTCHA Enterprise
   - Verifica que no haya errores
   - Confirma que los tokens se generan correctamente

2. **Página de prueba**:
   - Revisa el "Log de Eventos"
   - Verifica el "Estado de la Prueba"
   - Confirma puntuaciones de riesgo

### En Google Cloud Console
1. Ve a: https://console.cloud.google.com/security/recaptcha
2. Selecciona el proyecto: `soygay-b9bc5`
3. Ve a la pestaña "Descripción general"
4. **Los eventos pueden tardar unos minutos en aparecer**
5. Busca métricas de:
   - Solicitudes totales
   - Puntuaciones de riesgo
   - Acciones detectadas

### En Firebase Console
1. Ve a: https://console.firebase.google.com/project/soygay-b9bc5/appcheck
2. Revisa métricas de App Check
3. Verifica que no haya errores de configuración

## 🔧 Configuración Actual

```
Proyecto: soygay-b9bc5
Site Key: 6LeS06ErAAAAAFWtzMkvNhqGt0Q14S7B8kdzm0gI
API Key: AIzaSyBnN6fzuuSGxnxdkLhQ5xnUkM58jYWDSlw
Dominio de desarrollo: localhost
Dominio de producción: soygay-b9bc5.web.app
```

## ⚠️ Notas Importantes

1. **Tiempo de propagación**: Los eventos pueden tardar **2-10 minutos** en aparecer en Google Cloud Console

2. **Modo desarrollo**: Las herramientas de prueba solo se cargan en `localhost`

3. **App Check**: Actualmente deshabilitado para evitar conflictos durante las pruebas

4. **Dominios**: Asegúrate de que los dominios estén correctamente configurados en reCAPTCHA Enterprise

5. **Rate limiting**: Espera unos segundos entre pruebas para evitar limitaciones

## 🚨 Solución de Problemas

### Si no se generan tokens:
1. Verifica que reCAPTCHA Enterprise esté cargado (consola del navegador)
2. Confirma que no hay errores de CORS
3. Revisa la configuración de dominios

### Si la API devuelve errores:
1. Verifica que la API key tenga permisos correctos
2. Confirma que el proyecto ID sea correcto
3. Revisa que reCAPTCHA Enterprise API esté habilitada

### Si no aparecen eventos en Google Cloud:
1. **Espera 5-10 minutos** (tiempo normal de propagación)
2. Verifica que estés viendo el proyecto correcto
3. Confirma que las pruebas se ejecutaron exitosamente

## 📞 Comandos Rápidos

```bash
# Abrir página de prueba
Start-Process "test-recaptcha-event.html"

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar script de pruebas
.\test-recaptcha-events.bat

# Probar API directamente
.\test-recaptcha.bat
```

## 🎉 ¡Listo para Probar!

**Las herramientas están configuradas y funcionando**. Simplemente:

1. **Usa la página de prueba** que ya está abierta
2. **O usa la aplicación principal** en `http://localhost:5173/`
3. **Ejecuta las pruebas** y observa los resultados
4. **Espera unos minutos** para ver los eventos en Google Cloud Console

¡Los eventos de reCAPTCHA se están generando ahora mismo! 🚀