import React from 'react';
import './ConversationList.css';

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  currentUserId 
}) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  const hasUnreadMessages = (conversation) => {
    // This would typically be determined by checking if there are unread messages
    // For now, we'll use a simple heuristic
    return conversation.lastMessage && 
           conversation.lastMessage.sender !== currentUserId &&
           !conversation.lastMessage.read;
  };

  if (conversations.length === 0) {
    return (
      <div className="conversation-list-empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No conversations yet</h3>
          <p>Start matching with people to begin chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isActive = activeConversation?._id === conversation._id;
        const unread = hasUnreadMessages(conversation);
        
        return (
          <div
            key={conversation._id}
            className={`conversation-item ${
              isActive ? 'active' : ''
            } ${unread ? 'unread' : ''}`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="conversation-avatar">
              <img
                src={otherParticipant?.profilePhoto || '/default-avatar.svg'}
                alt={otherParticipant?.name}
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
              <div className="online-indicator"></div>
            </div>
            
            <div className="conversation-content">
              <div className="conversation-header">
                <h4 className="participant-name">
                  {otherParticipant?.name || 'Unknown User'}
                </h4>
                <span className="message-time">
                  {conversation.lastMessageDate && formatTime(conversation.lastMessageDate)}
                </span>
              </div>
              
              <div className="conversation-preview">
                <p className="last-message">
                  {conversation.lastMessageText 
                    ? truncateMessage(conversation.lastMessageText)
                    : 'Start a conversation...'
                  }
                </p>
                {unread && <div className="unread-dot"></div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;