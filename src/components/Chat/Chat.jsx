import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import './Chat.css';

const Chat = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);
    socketRef.current = newSocket;

    // Join user's personal room for notifications
    if (user?.id) {
      newSocket.emit('join_user_room', user.id);
    }

    // Socket event listeners
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      updateConversationLastMessage(message);
    });

    newSocket.on('message_notification', (notification) => {
      // Update unread count and conversation list
      setUnreadCount(prev => prev + 1);
      updateConversationLastMessage(notification.message);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`New message from ${notification.sender.name}`, {
          body: notification.message.content,
          icon: notification.sender.profilePhoto || '/default-avatar.svg'
        });
      }
    });

    newSocket.on('user_typing', (data) => {
      // Handle typing indicator
      console.log(`${data.userName} is typing...`);
    });

    newSocket.on('user_stopped_typing', (data) => {
      // Handle stop typing
      console.log(`User ${data.userId} stopped typing`);
    });

    newSocket.on('messages_read', (data) => {
      // Update message read status
      setMessages(prev => 
        prev.map(msg => 
          data.messageIds.includes(msg._id) 
            ? { ...msg, read: true, readAt: new Date() }
            : msg
        )
      );
    });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Load conversations on component mount
    loadConversations();
    loadUnreadCount();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!activeConversation || !content.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/conversations/${activeConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });
      
      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        updateConversationLastMessage(message);
        
        // Emit socket event for real-time delivery
        const recipientId = activeConversation.participants.find(p => p._id !== user.id)?._id;
        socket.emit('send_message', {
          conversationId: activeConversation._id,
          recipientId,
          message,
          sender: { id: user.id, name: user.name }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateConversationLastMessage = (message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === message.conversation
          ? {
              ...conv,
              lastMessage: message,
              lastMessageText: message.content,
              lastMessageDate: message.createdAt
            }
          : conv
      ).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate))
    );
  };

  const selectConversation = (conversation) => {
    // Leave previous conversation room
    if (activeConversation && socket) {
      socket.emit('leave_conversation', activeConversation._id);
    }
    
    setActiveConversation(conversation);
    loadMessages(conversation._id);
    
    // Join new conversation room
    if (socket) {
      socket.emit('join_conversation', conversation._id);
    }
  };

  const startNewConversation = async (participantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId })
      });
      
      if (response.ok) {
        const conversation = await response.json();
        setConversations(prev => [conversation, ...prev]);
        selectConversation(conversation);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={selectConversation}
          currentUserId={user?.id}
        />
      </div>
      
      <div className="chat-main">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onSendMessage={sendMessage}
            currentUser={user}
            socket={socket}
          />
        ) : (
          <div className="chat-empty">
            <div className="empty-state">
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;