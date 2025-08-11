import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

const ChatWindow = ({ 
  conversation, 
  messages, 
  onSendMessage, 
  currentUser, 
  socket 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const otherParticipant = conversation.participants.find(p => p._id !== currentUser?.id);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('user_typing', (data) => {
        if (data.userId !== currentUser?.id) {
          setTypingUsers(prev => {
            if (!prev.find(user => user.userId === data.userId)) {
              return [...prev, data];
            }
            return prev;
          });
        }
      });

      socket.on('user_stopped_typing', (data) => {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      });

      return () => {
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [socket, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && conversation) {
      if (value.trim() && !isTyping) {
        setIsTyping(true);
        socket.emit('typing_start', {
          conversationId: conversation._id,
          userId: currentUser?.id,
          userName: currentUser?.name
        });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socket.emit('typing_stop', {
            conversationId: conversation._id,
            userId: currentUser?.id
          });
        }
      }, 1000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
      
      // Stop typing indicator
      if (isTyping && socket) {
        setIsTyping(false);
        socket.emit('typing_stop', {
          conversationId: conversation._id,
          userId: currentUser?.id
        });
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Focus back on input
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });
    
    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) {
      return 'Today';
    } else if (dateString === yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-window-header">
        <div className="participant-info">
          <img
            src={otherParticipant?.profilePhoto || '/default-avatar.svg'}
            alt={otherParticipant?.name}
            className="participant-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          <div className="participant-details">
            <h3>{otherParticipant?.name || 'Unknown User'}</h3>
            <span className="participant-status">
              {otherParticipant?.age && `${otherParticipant.age} years old`}
              {otherParticipant?.location && ` • ${otherParticipant.location}`}
            </span>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn" title="Video call">
            📹
          </button>
          <button className="action-btn" title="Voice call">
            📞
          </button>
          <button className="action-btn" title="More options">
            ⋯
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messageGroups.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-content">
              <h4>Start your conversation with {otherParticipant?.name}</h4>
              <p>Say hello and break the ice! 👋</p>
            </div>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="message-group">
              <div className="date-separator">
                <span>{formatDateHeader(group.date)}</span>
              </div>
              
              {group.messages.map((message, index) => (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isOwn={message.sender._id === currentUser?.id}
                  showAvatar={
                    index === 0 || 
                    group.messages[index - 1].sender._id !== message.sender._id
                  }
                  showTime={
                    index === group.messages.length - 1 ||
                    group.messages[index + 1].sender._id !== message.sender._id ||
                    (new Date(group.messages[index + 1].createdAt) - new Date(message.createdAt)) > 300000 // 5 minutes
                  }
                  formatTime={formatTime}
                />
              ))}
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <span className="typing-text">
              {typingUsers[0].userName} is typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <button type="button" className="attachment-btn" title="Attach file">
            📎
          </button>
          
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherParticipant?.name || 'user'}...`}
            className="message-input"
            rows={1}
            maxLength={1000}
          />
          
          <button 
            type="submit" 
            className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
            disabled={!newMessage.trim()}
            title="Send message"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;