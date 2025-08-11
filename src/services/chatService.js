import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

class ChatService {
  // Enviar mensaje
  async sendMessage(matchId, senderId, content, type = 'text') {
    try {
      const messageData = {
        matchId,
        senderId,
        content,
        type,
        createdAt: serverTimestamp(),
        read: false
      };
      
      // Agregar mensaje a la colección
      const messageRef = await addDoc(collection(db, 'messages'), messageData);
      
      // Actualizar último mensaje en el match
      await updateDoc(doc(db, 'matches', matchId), {
        lastMessage: type === 'private_album' ? '📸 Álbum privado compartido' : content,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: senderId
      });
      
      return {
        success: true,
        messageId: messageRef.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Enviar álbum privado
  async sendPrivateAlbum(matchId, senderId, photos) {
    try {
      const albumData = {
        matchId,
        senderId,
        content: {
          photos: photos,
          message: 'Te he compartido mi álbum privado 🔒'
        },
        type: 'private_album',
        createdAt: serverTimestamp(),
        read: false
      };
      
      // Agregar mensaje a la colección
      const messageRef = await addDoc(collection(db, 'messages'), albumData);
      
      // Actualizar último mensaje en el match
      await updateDoc(doc(db, 'matches', matchId), {
        lastMessage: '📸 Álbum privado compartido',
        lastMessageAt: serverTimestamp(),
        lastMessageSender: senderId
      });
      
      return {
        success: true,
        messageId: messageRef.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener mensajes de una conversación
  async getMessages(matchId, limitCount = 50) {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('matchId', '==', matchId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = [];
      
      messagesSnapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Invertir para mostrar en orden cronológico
      return {
        success: true,
        messages: messages.reverse()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Escuchar mensajes en tiempo real
  onMessagesUpdate(matchId, callback) {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(messages);
    });
  }
  
  // Marcar mensajes como leídos
  async markMessagesAsRead(matchId, userId) {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('matchId', '==', matchId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const updatePromises = [];
      messagesSnapshot.forEach(doc => {
        updatePromises.push(
          updateDoc(doc.ref, { read: true })
        );
      });
      
      await Promise.all(updatePromises);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Obtener conversaciones del usuario
  async getUserConversations(userId) {
    try {
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const conversations = [];
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(uid => uid !== userId);
        
        // Obtener datos del otro usuario
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (otherUserDoc.exists()) {
          // Contar mensajes no leídos
          const unreadQuery = query(
            collection(db, 'messages'),
            where('matchId', '==', matchDoc.id),
            where('senderId', '==', otherUserId),
            where('read', '==', false)
          );
          
          const unreadSnapshot = await getDocs(unreadQuery);
          
          conversations.push({
            id: matchDoc.id,
            ...matchData,
            otherUser: {
              id: otherUserId,
              ...otherUserDoc.data()
            },
            unreadCount: unreadSnapshot.size
          });
        }
      }
      
      return {
        success: true,
        conversations
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Escuchar actualizaciones de conversaciones
  onConversationsUpdate(userId, callback) {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    return onSnapshot(matchesQuery, async (snapshot) => {
      const conversations = [];
      
      for (const matchDoc of snapshot.docs) {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(uid => uid !== userId);
        
        // Obtener datos del otro usuario
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (otherUserDoc.exists()) {
          conversations.push({
            id: matchDoc.id,
            ...matchData,
            otherUser: {
              id: otherUserId,
              ...otherUserDoc.data()
            }
          });
        }
      }
      
      callback(conversations);
    });
  }
  
  // Obtener matches del usuario para compartir álbum
  async getUserMatches(userId) {
    try {
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', userId)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matches = [];
      
      for (const matchDoc of matchesSnapshot.docs) {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(uid => uid !== userId);
        
        // Obtener datos del otro usuario
        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (otherUserDoc.exists()) {
          const otherUserData = otherUserDoc.data();
          matches.push({
            id: matchDoc.id,
            userId: otherUserId,
            name: otherUserData.name || otherUserData.displayName || 'Usuario',
            profilePhoto: otherUserData.profilePhoto || null,
            lastMessage: matchData.lastMessage || 'Sin mensajes'
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
  
  // Eliminar conversación
  async deleteConversation(matchId) {
    try {
      // Eliminar todos los mensajes
      const messagesQuery = query(
        collection(db, 'messages'),
        where('matchId', '==', matchId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = [];
      
      messagesSnapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
      // Eliminar el match
      await deleteDoc(doc(db, 'matches', matchId));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ChatService();