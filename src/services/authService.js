import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

class AuthService {
  // Registrar nuevo usuario con email/contraseña
  async register(userData) {
    try {
      const { email, password, username } = userData;
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar perfil con username
      await updateProfile(user, { displayName: username });
      
      // Crear documento de usuario en Firestore con datos básicos
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: username,
        createdAt: new Date(),
        lastActive: new Date(),
        profileComplete: false,
        // Campos del perfil que se completarán después
        name: '',
        age: null,
        location: '',
        genderIdentity: '',
        sexualOrientation: '',
        bio: '',
        interests: [],
        profilePicture: null
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          username: username,
          displayName: username
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar con Google
  async registerWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Verificar si es un usuario nuevo
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Crear documento de usuario nuevo
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName || user.email.split('@')[0],
          createdAt: new Date(),
          lastActive: new Date(),
          profileComplete: false,
          profilePicture: user.photoURL || null,
          // Campos del perfil que se completarán después
          name: user.displayName || '',
          age: null,
          location: '',
          genderIdentity: '',
          sexualOrientation: '',
          bio: '',
          interests: []
        });
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Registrar con Facebook
  async registerWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Verificar si es un usuario nuevo
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Crear documento de usuario nuevo
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName || user.email.split('@')[0],
          createdAt: new Date(),
          lastActive: new Date(),
          profileComplete: false,
          profilePicture: user.photoURL || null,
          // Campos del perfil que se completarán después
          name: user.displayName || '',
          age: null,
          location: '',
          genderIdentity: '',
          sexualOrientation: '',
          bio: '',
          interests: []
        });
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Iniciar sesión
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar última actividad
      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: new Date()
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Cerrar sesión
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener usuario actual
  getCurrentUser() {
    return auth.currentUser;
  }
  
  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  // Obtener perfil completo del usuario
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          success: true,
          user: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Actualizar perfil de usuario
  async updateUserProfile(uid, profileData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...profileData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new AuthService();