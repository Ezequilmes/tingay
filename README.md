# Tingay - LGBTQ+ Dating App

Una aplicación de citas inclusiva para la comunidad LGBTQ+ construida con React y Node.js.

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