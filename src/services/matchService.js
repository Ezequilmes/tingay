import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  onSnapshot,
  GeoPoint
} from 'firebase/firestore';
import { db } from '../firebase';

class MatchService {
  // Enviar corazón (like)
  async sendHeart(fromUserId, toUserId) {
    try {
      const heartId = `${fromUserId}_${toUserId}`;
      
      await setDoc(doc(db, 'hearts', heartId), {
        fromUserId,
        toUserId,
        createdAt: new Date(),
        status: 'sent'
      });
      
      // Verificar si hay match mutuo
      const reverseHeartId = `${toUserId}_${fromUserId}`;
      const reverseHeart = await getDoc(doc(db, 'hearts', reverseHeartId));
      
      if (reverseHeart.exists()) {
        // ¡Es un match!
        const matchId = [fromUserId, toUserId].sort().join('_');
        
        await setDoc(doc(db, 'matches', matchId), {
          users: [fromUserId, toUserId],
          createdAt: new Date(),
          lastMessage: null,
          lastMessageAt: null
        });
        
        // Actualizar estado de corazones
        await updateDoc(doc(db, 'hearts', heartId), { status: 'matched' });
        await updateDoc(doc(db, 'hearts', reverseHeartId), { status: 'matched' });
        
        return {
          success: true,
          isMatch: true,
          matchId
        };
      }
      
      return {
        success: true,
        isMatch: false
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Rechazar perfil (pass)
  async passProfile(fromUserId, toUserId) {
    try {
      const passId = `${fromUserId}_${toUserId}`;
      
      await setDoc(doc(db, 'passes', passId), {
        fromUserId,
        toUserId,
        createdAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener perfiles para mostrar
  async getProfilesToShow(userId, filters = {}) {
    try {
      // Obtener usuarios que ya fueron liked o passed
      const heartsQuery = query(
        collection(db, 'hearts'),
        where('fromUserId', '==', userId)
      );
      const passesQuery = query(
        collection(db, 'passes'),
        where('fromUserId', '==', userId)
      );
      
      const [heartsSnapshot, passesSnapshot] = await Promise.all([
        getDocs(heartsQuery),
        getDocs(passesQuery)
      ]);
      
      const excludedUserIds = new Set([userId]); // Excluir al usuario actual
      
      heartsSnapshot.forEach(doc => {
        excludedUserIds.add(doc.data().toUserId);
      });
      
      passesSnapshot.forEach(doc => {
        excludedUserIds.add(doc.data().toUserId);
      });
      
      // Obtener todos los usuarios
      let usersQuery = query(
        collection(db, 'users'),
        limit(20)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      let profiles = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (!excludedUserIds.has(userData.uid)) {
          profiles.push({
            id: userData.uid,
            ...userData
          });
        }
      });
      
      // Aplicar filtro de usuarios en línea si está activado
      if (filters.onlineOnly) {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        profiles = profiles.filter(profile => {
          // Considerar usuario en línea si:
          // 1. isOnline es true, O
          // 2. onlineStatus es 'online', O
          // 3. lastActive fue en los últimos 5 minutos
          const lastActive = profile.lastActive ? new Date(profile.lastActive.seconds * 1000) : null;
          
          return profile.isOnline || 
                 profile.onlineStatus === 'online' || 
                 (lastActive && lastActive > fiveMinutesAgo);
        });
      }
      
      return {
        success: true,
        profiles
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener matches del usuario
  async getUserMatches(userId) {
    try {
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matches = [];
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(uid => uid !== userId);
        
        // Obtener datos del otro usuario
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (otherUserDoc.exists()) {
          matches.push({
            id: matchDoc.id,
            ...matchData,
            otherUser: {
              id: otherUserId,
              ...otherUserDoc.data()
            }
          });
        }
      }
      
      return {
        success: true,
        matches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener corazones recibidos
  async getReceivedHearts(userId) {
    try {
      const heartsQuery = query(
        collection(db, 'hearts'),
        where('toUserId', '==', userId),
        where('status', '==', 'sent'),
        orderBy('createdAt', 'desc')
      );
      
      const heartsSnapshot = await getDocs(heartsQuery);
      const hearts = [];
      
      for (const heartDoc of heartsSnapshot.docs) {
        const heartData = heartDoc.data();
        
        // Obtener datos del usuario que envió el corazón
        const senderDoc = await getDoc(doc(db, 'users', heartData.fromUserId));
        
        if (senderDoc.exists()) {
          hearts.push({
            id: heartDoc.id,
            ...heartData,
            sender: {
              id: heartData.fromUserId,
              ...senderDoc.data()
            }
          });
        }
      }
      
      return {
        success: true,
        hearts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Bloquear usuario
  async blockUser(fromUserId, toUserId) {
    try {
      const blockId = `${fromUserId}_${toUserId}`;
      
      await setDoc(doc(db, 'blocks', blockId), {
        fromUserId,
        toUserId,
        createdAt: new Date()
      });
      
      // Eliminar match si existe
      const matchId = [fromUserId, toUserId].sort().join('_');
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      
      if (matchDoc.exists()) {
        await deleteDoc(doc(db, 'matches', matchId));
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Escuchar nuevos matches en tiempo real
  onNewMatches(userId, callback) {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(matchesQuery, callback);
  }
}

export default new MatchService();