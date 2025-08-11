const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { protect: auth } = require('../middleware/auth');

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json([]);
    }

    // Get conversations where user is a participant
    const conversationsSnapshot = await db.collection('conversations')
      .where('participants', 'array-contains', req.user.id)
      .orderBy('lastMessageDate', 'desc')
      .get();

    const conversations = [];
    for (const doc of conversationsSnapshot.docs) {
      const conversationData = doc.data();
      const conversation = {
        id: doc.id,
        ...conversationData,
        participants: []
      };

      // Get participant details
      for (const participantId of conversationData.participants) {
        const userDoc = await db.collection('users').doc(participantId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          conversation.participants.push({
            id: participantId,
            name: userData.name,
            profilePhoto: userData.profilePhoto,
            age: userData.age,
            location: userData.location
          });
        }
      }

      conversations.push(conversation);
    }

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get or create a conversation between two users
router.post('/conversations', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Firebase not available' });
    }

    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if users are matched
    const currentUser = req.user;
    if (!currentUser.matches || !currentUser.matches.includes(participantId)) {
      return res.status(403).json({ message: 'You can only chat with your matches' });
    }

    const participants = [req.user.id, participantId].sort();

    // Try to find existing conversation
    const existingConversationSnapshot = await db.collection('conversations')
      .where('participants', '==', participants)
      .limit(1)
      .get();

    let conversation;
    if (!existingConversationSnapshot.empty) {
      // Conversation exists
      const doc = existingConversationSnapshot.docs[0];
      conversation = { id: doc.id, ...doc.data() };
    } else {
      // Create new conversation
      const newConversationRef = await db.collection('conversations').add({
        participants: participants,
        createdAt: new Date(),
        lastMessage: null,
        lastMessageText: '',
        lastMessageDate: new Date(),
        isActive: true
      });
      
      const newConversationDoc = await newConversationRef.get();
      conversation = { id: newConversationDoc.id, ...newConversationDoc.data() };
    }

    // Get participant details
    conversation.participants = [];
    for (const participantId of participants) {
      const userDoc = await db.collection('users').doc(participantId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        conversation.participants.push({
          id: participantId,
          name: userData.name,
          profilePhoto: userData.profilePhoto,
          age: userData.age,
          location: userData.location
        });
      }
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Error creating/finding conversation:', error);
    res.status(500).json({ message: 'Error creating conversation' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json([]);
    }

    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is part of the conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages for this conversation
    const messagesSnapshot = await db.collection('messages')
      .where('conversation', '==', conversationId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit))
      .get();

    const messages = [];
    for (const doc of messagesSnapshot.docs) {
      const messageData = doc.data();
      
      // Get sender details
      const senderDoc = await db.collection('users').doc(messageData.sender).get();
      const senderData = senderDoc.exists ? senderDoc.data() : {};
      
      messages.push({
        id: doc.id,
        ...messageData,
        sender: {
          id: messageData.sender,
          name: senderData.name,
          profilePhoto: senderData.profilePhoto
        }
      });
    }

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Firebase not available' });
    }

    const { conversationId } = req.params;
    const { content, contentType = 'text' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is part of the conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the recipient (the other participant)
    const recipientId = conversationData.participants.find(p => p !== req.user.id);

    // Create the message
    const messageData = {
      sender: req.user.id,
      recipient: recipientId,
      conversation: conversationId,
      content: content.trim(),
      contentType,
      createdAt: new Date(),
      isRead: false
    };

    const messageRef = await db.collection('messages').add(messageData);
    const messageDoc = await messageRef.get();
    
    // Get sender details for response
    const senderDoc = await db.collection('users').doc(req.user.id).get();
    const senderData = senderDoc.exists ? senderDoc.data() : {};

    const message = {
      id: messageDoc.id,
      ...messageData,
      sender: {
        id: req.user.id,
        name: senderData.name,
        profilePhoto: senderData.profilePhoto
      }
    };

    // Update conversation with last message info
    await db.collection('conversations').doc(conversationId).update({
      lastMessage: messageRef.id,
      lastMessageText: content.trim(),
      lastMessageDate: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Firebase not available' });
    }

    const { conversationId } = req.params;
    
    // Verify user is part of the conversation
    const conversationDoc = await db.collection('conversations').doc(conversationId).get();
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversationData = conversationDoc.data();
    if (!conversationData.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages from the other user as read
    const unreadMessagesSnapshot = await db.collection('messages')
      .where('conversation', '==', conversationId)
      .where('recipient', '==', req.user.id)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    unreadMessagesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: new Date()
      });
    });

    await batch.commit();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({ unreadCount: 0 });
    }

    const unreadMessagesSnapshot = await db.collection('messages')
      .where('recipient', '==', req.user.id)
      .where('isRead', '==', false)
      .get();

    const unreadCount = unreadMessagesSnapshot.size;

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

module.exports = router;