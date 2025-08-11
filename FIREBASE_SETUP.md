# Configuración de Firebase para Tingay

Este documento explica cómo configurar Firebase para la aplicación Tingay.

## Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "tingay-app")
4. Sigue los pasos de configuración

### 2. Configurar Authentication

1. En la consola de Firebase, ve a "Authentication"
2. Haz clic en "Comenzar"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Correo electrónico/contraseña"

### 3. Configurar Firestore Database

1. Ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (cambiarás las reglas después)
4. Elige una ubicación cercana a tus usuarios

### 4. Configurar Storage

1. Ve a "Storage"
2. Haz clic en "Comenzar"
3. Acepta las reglas por defecto (las cambiarás después)

### 5. Obtener las credenciales del proyecto

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. Baja hasta "Tus aplicaciones"
3. Haz clic en "Aplicación web" (ícono </>
4. Registra tu aplicación con un nombre
5. Copia la configuración que aparece

### 6. Configurar las variables de entorno

Edita el archivo `.env` en la raíz del proyecto y reemplaza los valores placeholder:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 7. Configurar reglas de seguridad

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read other users' profiles for discovery
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Chat messages
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
    
    // Hearts and matches
    match /hearts/{heartId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.from || request.auth.uid == resource.data.to);
    }
    
    match /matches/{matchId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.users;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own profile photos
    match /users/{userId}/photos/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow reading profile photos for discovery
    match /users/{userId}/photos/{allPaths=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### 8. Inicializar Firebase en el proyecto

Ejecuta el siguiente comando para inicializar Firebase:

```bash
firebase init
```

Selecciona:
- Firestore
- Storage
- Hosting (opcional)

### 9. Estructura de datos en Firestore

La aplicación creará automáticamente las siguientes colecciones:

#### Users Collection
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  name: "Nombre Usuario",
  age: 25,
  bio: "Descripción del usuario",
  photos: ["url1", "url2"],
  location: {
    latitude: 0,
    longitude: 0,
    city: "Ciudad"
  },
  interests: ["música", "deportes"],
  orientation: "heterosexual",
  preferredLanguage: "es",
  createdAt: timestamp,
  lastActive: timestamp
}
```

#### Hearts Collection
```javascript
{
  from: "sender_uid",
  to: "receiver_uid",
  createdAt: timestamp,
  seen: false
}
```

#### Matches Collection
```javascript
{
  users: ["uid1", "uid2"],
  createdAt: timestamp,
  lastMessage: {
    text: "Último mensaje",
    timestamp: timestamp,
    from: "sender_uid"
  }
}
```

#### Chats Collection
```javascript
{
  participants: ["uid1", "uid2"],
  createdAt: timestamp,
  lastMessage: {
    text: "Último mensaje",
    timestamp: timestamp,
    from: "sender_uid"
  }
}
```

#### Messages Subcollection
```javascript
{
  text: "Contenido del mensaje",
  from: "sender_uid",
  timestamp: timestamp,
  read: false
}
```

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Desplegar a Firebase Hosting
firebase deploy
```

## Notas importantes

1. **Seguridad**: Nunca compartas tus credenciales de Firebase públicamente
2. **Reglas**: Configura las reglas de seguridad antes de ir a producción
3. **Límites**: Firebase tiene límites gratuitos, revisa la documentación
4. **Backup**: Considera configurar backups automáticos de Firestore

## Migración desde MongoDB

Si tienes datos existentes en MongoDB, puedes crear un script de migración para transferir los datos a Firestore. Los servicios de Firebase ya están configurados para trabajar con la nueva estructura de datos.