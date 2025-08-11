# Dating App - Firebase Integration

Una aplicación de citas moderna construida con React y Firebase, desplegada en Firebase Hosting.

## 🚀 Características

- **Autenticación**: Sistema completo de registro y login con Firebase Auth
- **Perfiles de usuario**: Creación y edición de perfiles con fotos
- **Sistema de matches**: Algoritmo de emparejamiento basado en preferencias
- **Chat en tiempo real**: Mensajería instantánea entre usuarios emparejados
- **Subida de fotos**: Almacenamiento seguro en Firebase Storage
- **Responsive**: Diseño adaptable para móviles y escritorio

## 🛠️ Tecnologías

### Frontend
- React 18
- Vite (build tool)
- CSS3 con diseño moderno
- Firebase SDK v10

### Backend & Servicios
- Firebase Authentication
- Firebase Firestore (base de datos)
- Firebase Storage (almacenamiento de archivos)
- Firebase Hosting (despliegue)
- Firebase App Check (seguridad)

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de Firebase
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🔧 Configuración de Firebase

### Requisitos previos
- Cuenta de Firebase
- Firebase CLI instalado
- Proyecto de Firebase creado

### Servicios a habilitar
1. **Authentication** - Proveedores: Email/Password, Google
2. **Firestore Database** - Modo producción
3. **Storage** - Reglas de seguridad configuradas
4. **Hosting** - Para despliegue
5. **App Check** - reCAPTCHA Enterprise (opcional)

### Archivos de configuración
- `firebase.json` - Configuración del proyecto
- `firestore.rules` - Reglas de seguridad de Firestore
- `storage.rules` - Reglas de seguridad de Storage
- `.firebaserc` - Configuración del proyecto activo

## 🚀 Despliegue

### Despliegue automático
```bash
# Windows
.\deploy.bat

# Manual
npm run build
firebase deploy --only hosting
```

### URLs de producción
- **App**: https://soygay-b9bc5.web.app
- **Console**: https://console.firebase.google.com/project/soygay-b9bc5

## 📁 Estructura del proyecto

```
app/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Chat/           # Sistema de chat
│   │   ├── ProfileSetup/   # Configuración de perfil
│   │   ├── ProfileGrid/    # Vista de perfiles
│   │   └── ...
│   ├── services/           # Servicios de Firebase
│   ├── hooks/              # Custom hooks
│   └── firebase.js         # Configuración de Firebase
├── functions/              # Firebase Functions
├── dataconnect/           # Firebase Data Connect
├── config/                # Configuraciones del servidor
├── routes/                # Rutas del backend
├── middleware/            # Middlewares de seguridad
└── dist/                  # Build de producción
```

## 🔐 Seguridad

### Implementado
- ✅ Reglas de seguridad de Firestore
- ✅ Reglas de seguridad de Storage
- ✅ Middleware de autenticación
- ✅ Validación de datos
- ✅ CORS configurado
- ✅ App Check (temporalmente deshabilitado)

### Pendiente
- ⏳ Configuración completa de reCAPTCHA Enterprise
- ⏳ Configuración de dominios autorizados
- ⏳ Configuración de IAM para Storage

## 📚 Documentación adicional

- [`FIREBASE_DEPLOYMENT_GUIDE.md`](./FIREBASE_DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- [`RECAPTCHA_ENTERPRISE_SETUP.md`](./RECAPTCHA_ENTERPRISE_SETUP.md) - Configuración de reCAPTCHA
- [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) - Configuración inicial de Firebase
- [`CRITICAL_FIXES.md`](./CRITICAL_FIXES.md) - Correcciones implementadas

## 🐛 Solución de problemas

### Errores comunes

1. **Error de reCAPTCHA**: Verificar configuración en Firebase Console
2. **Error de CORS**: Verificar configuración en `cors.json`
3. **Error de permisos**: Verificar reglas de Firestore y Storage

### Logs y debugging
```bash
# Ver logs de Firebase
firebase functions:log

# Debug local
npm run dev
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

Para soporte o preguntas sobre el proyecto, por favor abre un issue en GitHub.

---

**Estado del proyecto**: ✅ Desplegado y funcional  
**Última actualización**: Diciembre 2024

## 🚀 Configuración para Usuarios Reales

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB Atlas cuenta (recomendado) o MongoDB local
- Git

### 1. Configuración de la Base de Datos

#### Opción A: MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un nuevo cluster
3. Configura un usuario de base de datos
4. Obtén tu string de conexión
5. Actualiza `MONGODB_URI` en el archivo `.env`

#### Opción B: MongoDB Local
1. Instala MongoDB localmente
2. Actualiza `MONGODB_URI` en `.env` a: `mongodb://localhost:27017/tingay`

### 2. Configuración del Entorno

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno en `.env`:
```env
# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Conexión a MongoDB
MONGODB_URI=tu_string_de_conexion_mongodb

# Secreto JWT (¡CAMBIA ESTO EN PRODUCCIÓN!)
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Claves de API (opcional)
GEOCODING_API_KEY=tu_clave_de_geocodificacion
```

### 3. Iniciar la Aplicación

#### Desarrollo
```bash
# Terminal 1: Iniciar el backend
node server.js

# Terminal 2: Iniciar el frontend
npm run dev:frontend
```

#### Producción
```bash
# Construir el frontend
npm run build

# Iniciar el servidor
NODE_ENV=production node server.js
```

### 4. Funcionalidades Implementadas

✅ **Sistema de Autenticación**
- Registro de usuarios
- Inicio de sesión
- Autenticación JWT
- Perfiles de usuario completos

✅ **Sistema de Descubrimiento**
- Exploración de perfiles
- Filtros de búsqueda
- Geolocalización
- Sistema de likes/pass

✅ **Sistema de Corazones** 💖
- Envío de corazones
- Notificaciones de corazones recibidos
- Historial de corazones
- Marcado como visto

✅ **Sistema de Bloqueo** 🚫
- Bloquear usuarios
- Lista de usuarios bloqueados
- Desbloquear usuarios
- Filtrado automático

✅ **Chat en Tiempo Real**
- Mensajería instantánea
- Socket.io para tiempo real
- Historial de conversaciones

✅ **Configuración de Usuario**
- Edición de perfil
- Preferencias de idioma
- Gestión de cuenta

### 5. Estructura de la Base de Datos

#### Modelo de Usuario
```javascript
{
  username: String,
  email: String,
  password: String (hasheada),
  name: String,
  age: Number,
  location: String,
  coordinates: { type: 'Point', coordinates: [lng, lat] },
  genderIdentity: String,
  sexualOrientation: String,
  bio: String,
  profilePicture: String,
  photos: [String],
  interests: [String],
  preferences: {
    ageMin: Number,
    ageMax: Number,
    distance: Number,
    genderPreferences: [String]
  },
  blockedUsers: [ObjectId],
  likedUsers: [ObjectId],
  passedUsers: [ObjectId],
  matches: [ObjectId],
  receivedHearts: [{
    fromUserId: ObjectId,
    message: String,
    timestamp: Date,
    seen: Boolean
  }],
  createdAt: Date,
  lastActive: Date
}
```

### 6. API Endpoints

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener perfil actual
- `PUT /api/auth/profile` - Actualizar perfil

#### Usuarios
- `GET /api/users/discover` - Obtener usuarios para descubrir
- `POST /api/users/like` - Dar like a un usuario
- `POST /api/users/pass` - Pasar un usuario
- `GET /api/users/matches` - Obtener matches

#### Corazones
- `POST /api/users/send-heart` - Enviar corazón
- `GET /api/users/hearts` - Obtener corazones recibidos
- `PUT /api/users/hearts/mark-seen` - Marcar corazones como vistos

#### Bloqueo
- `POST /api/users/block` - Bloquear usuario
- `POST /api/users/unblock` - Desbloquear usuario
- `GET /api/users/blocked` - Obtener usuarios bloqueados

#### Chat
- `GET /api/chat/conversations` - Obtener conversaciones
- `GET /api/chat/messages/:conversationId` - Obtener mensajes
- `POST /api/chat/send` - Enviar mensaje

### 7. Seguridad

🔒 **Medidas Implementadas:**
- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Validación de datos de entrada
- Protección de rutas
- CORS configurado
- Variables de entorno para secretos

### 8. Despliegue

#### Heroku
1. Instala Heroku CLI
2. Crea una nueva app: `heroku create tu-app-name`
3. Configura variables de entorno: `heroku config:set MONGODB_URI=tu_uri`
4. Despliega: `git push heroku main`

#### Vercel/Netlify
1. Conecta tu repositorio
2. Configura variables de entorno
3. Despliega automáticamente

### 9. Monitoreo y Mantenimiento

- Revisa logs regularmente
- Monitorea el uso de la base de datos
- Actualiza dependencias periódicamente
- Realiza backups de la base de datos

### 10. Soporte

Para reportar bugs o solicitar funcionalidades:
1. Crea un issue en GitHub
2. Incluye pasos para reproducir
3. Especifica el entorno (desarrollo/producción)

---

¡Tu aplicación Tingay está lista para usuarios reales! 🎉

**Nota:** Recuerda cambiar todas las claves y secretos antes de ir a producción.