import React, { useState, useEffect } from 'react';
import './ProfileDetail.css';

const ProfileDetail = ({ profile, onBack, onMessage, onBlock, onReport, onSendHeart, currentUser }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [heartSent, setHeartSent] = useState(false);

  useEffect(() => {
    // Reset photo index when profile changes
    setCurrentPhotoIndex(0);
    setShowFullBio(false);
  }, [profile]);

  if (!profile) {
    return (
      <div className="profile-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
  };

  const handleBlock = () => {
    setIsBlocked(true);
    if (onBlock) onBlock(profile.id);
  };

  const handleReport = (reason) => {
    if (onReport) onReport(profile.id, reason);
    setShowReportModal(false);
  };

  const handleSendHeart = () => {
    if (onSendHeart && !heartSent) {
      onSendHeart(profile.id);
      setHeartSent(true);
    }
  };



  const formatDistance = (distance) => {
    const km = parseFloat(distance.replace(' km', ''));
    if (km < 1) {
      return `${Math.round(km * 1000)}m de distancia`;
    }
    return `${distance} de distancia`;
  };

  const truncateBio = (bio, maxLength = 150) => {
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + '...';
  };

  return (
    <div className="profile-detail-container">
      <div className="profile-detail-header">
        <button className="back-btn" onClick={onBack}>
          <span>←</span>
        </button>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setShowReportModal(true)}>
            <span>⚠️</span>
          </button>
          <button className="action-btn" onClick={handleBlock}>
            <span>🚫</span>
          </button>
        </div>
      </div>

      <div className="profile-detail-content">
        {/* Photo Gallery */}
        <div className="photo-gallery">
          <div className="main-photo-container">
            <img 
              src={profile.photos[currentPhotoIndex] || '/default-avatar.svg'}
              alt={`${profile.name} - Foto ${currentPhotoIndex + 1}`}
              className="main-photo"
              onError={(e) => {
                e.target.src = '/default-avatar.svg';
              }}
            />
            
            {profile.photos.length > 1 && (
              <>
                <button className="photo-nav prev" onClick={handlePrevPhoto}>
                  <span>‹</span>
                </button>
                <button className="photo-nav next" onClick={handleNextPhoto}>
                  <span>›</span>
                </button>
                
                <div className="photo-indicators">
                  {profile.photos.map((_, index) => (
                    <button
                      key={index}
                      className={`photo-indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                      onClick={() => handlePhotoClick(index)}
                    />
                  ))}
                </div>
              </>
            )}
            
            {profile.online && <div className="online-status">En línea</div>}
            {profile.verified && (
              <div className="verified-badge-large">
                <span>✓</span> Verificado
              </div>
            )}
          </div>
          
          {profile.photos.length > 1 && (
            <div className="photo-thumbnails">
              {profile.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${profile.name} - Miniatura ${index + 1}`}
                  className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                  onClick={() => handlePhotoClick(index)}
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="profile-header-info">
            <div className="name-age-container">
              <h1 className="profile-name">{profile.name}</h1>
              <span className="profile-age">{profile.age} años</span>
            </div>
            
            <div className="profile-meta">
              <div className="location-distance">
                <span className="location-icon">📍</span>
                <span>{profile.location} • {formatDistance(profile.distance)}</span>
              </div>
              
              {profile.lastSeen && (
                <div className="last-seen-info">
                  <span className="last-seen-icon">🕐</span>
                  <span>Visto por última vez {profile.lastSeen}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="bio-section">
            <h3>Acerca de {profile.name}</h3>
            <div className="bio-content">
              <p>
                {showFullBio ? profile.bio : truncateBio(profile.bio)}
              </p>
              {profile.bio.length > 150 && (
                <button 
                  className="show-more-btn"
                  onClick={() => setShowFullBio(!showFullBio)}
                >
                  {showFullBio ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="basic-info-section">
            <h3>Información básica</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Orientación:</span>
                <span className="info-value">{profile.orientation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Edad:</span>
                <span className="info-value">{profile.age} años</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ubicación:</span>
                <span className="info-value">{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="interests-section">
              <h3>Intereses</h3>
              <div className="interests-grid">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="interest-chip">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isBlocked && (
        <div className="profile-actions">
          <button 
            className={`action-button ${heartSent ? 'heart-sent' : 'heart-button'}`}
            onClick={handleSendHeart}
            disabled={heartSent}
          >
            <span>{heartSent ? '💖' : '🤍'}</span>
            {heartSent ? 'Corazón enviado' : 'Enviar corazón'}
          </button>
          <button 
            className="action-button primary"
            onClick={() => onMessage && onMessage(profile)}
          >
            <span>💬</span>
            Enviar mensaje
          </button>
          <button 
            className="action-button danger"
            onClick={handleBlock}
          >
            <span>🚫</span>
            Bloquear
          </button>
        </div>
      )}

      {isBlocked && (
        <div className="blocked-message">
          <p>Has bloqueado a este usuario</p>
          <button className="unblock-btn" onClick={() => setIsBlocked(false)}>
            Desbloquear
          </button>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reportar usuario</h3>
            <p>¿Por qué quieres reportar a {profile.name}?</p>
            <div className="report-reasons">
              <button onClick={() => handleReport('spam')}>Spam</button>
              <button onClick={() => handleReport('inappropriate')}>Contenido inapropiado</button>
              <button onClick={() => handleReport('fake')}>Perfil falso</button>
              <button onClick={() => handleReport('harassment')}>Acoso</button>
              <button onClick={() => handleReport('other')}>Otro</button>
            </div>
            <button className="cancel-btn" onClick={() => setShowReportModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail;