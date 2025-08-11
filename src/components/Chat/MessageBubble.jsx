import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ 
  message, 
  isOwn, 
  showAvatar, 
  showTime, 
  formatTime 
}) => {
  const renderMessageContent = () => {
    switch (message.contentType) {
      case 'text':
        return (
          <div className="message-text">
            {message.content}
          </div>
        );
      case 'image':
        return (
          <div className="message-image">
            <img 
              src={message.content} 
              alt="Shared image" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-error" style={{ display: 'none' }}>
              Failed to load image
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="message-file">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <span className="file-name">{message.fileName || 'File'}</span>
              <span className="file-size">{message.fileSize || 'Unknown size'}</span>
            </div>
            <button className="download-btn">Download</button>
          </div>
        );
      default:
        return (
          <div className="message-text">
            {message.content}
          </div>
        );
    }
  };

  const getMessageStatus = () => {
    if (!isOwn) return null;
    
    if (message.read) {
      return (
        <span className="message-status read" title={`Read at ${new Date(message.readAt).toLocaleString()}`}>
          ✓✓
        </span>
      );
    } else if (message.delivered) {
      return (
        <span className="message-status delivered" title="Delivered">
          ✓✓
        </span>
      );
    } else {
      return (
        <span className="message-status sent" title="Sent">
          ✓
        </span>
      );
    }
  };

  return (
    <div className={`message-bubble-container ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          <img
            src={message.sender?.profilePhoto || '/default-avatar.svg'}
            alt={message.sender?.name}
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
        </div>
      )}
      
      <div className="message-bubble-wrapper">
        <div className={`message-bubble ${isOwn ? 'own' : 'other'} ${message.contentType}`}>
          {renderMessageContent()}
          
          {showTime && (
            <div className="message-meta">
              <span className="message-time">
                {formatTime(message.createdAt)}
              </span>
              {getMessageStatus()}
            </div>
          )}
        </div>
        
        {!showTime && isOwn && (
          <div className="message-status-only">
            {getMessageStatus()}
          </div>
        )}
      </div>
      
      {isOwn && showAvatar && (
        <div className="message-avatar own">
          <img
            src={message.sender?.profilePhoto || '/default-avatar.svg'}
            alt={message.sender?.name}
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;