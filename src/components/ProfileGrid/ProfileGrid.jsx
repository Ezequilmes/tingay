import React, { useState, useEffect } from 'react';
import onlineStatusService from '../../services/onlineStatusService';
import SearchFilters from '../SearchFilters/SearchFilters';
import './ProfileGrid.css';

const ProfileGrid = ({ profiles = [], onProfileClick, searchFilters = {}, userLocation, onFiltersChange }) => {
  const [filteredProfiles, setFilteredProfiles] = useState(profiles || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchFilters]);

  const filterProfiles = () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!profiles || !Array.isArray(profiles)) {
        setFilteredProfiles([]);
        setLoading(false);
        return;
      }
      
      let filtered = [...profiles];

      // Filter by age range
      if (searchFilters.ageRange) {
        filtered = filtered.filter(profile => 
          profile.age >= searchFilters.ageRange[0] && 
          profile.age <= searchFilters.ageRange[1]
        );
      }

      // Filter by orientation
      if (searchFilters.orientation && searchFilters.orientation !== 'all') {
        filtered = filtered.filter(profile => 
          profile.orientation.toLowerCase() === searchFilters.orientation.toLowerCase()
        );
      }

      // Filter by interests
      if (searchFilters.interests && searchFilters.interests.length > 0) {
        filtered = filtered.filter(profile => 
          profile.interests.some(interest => 
            searchFilters.interests.includes(interest)
          )
        );
      }

      // Filter by online status
      if (searchFilters.onlineOnly) {
        filtered = filtered.filter(profile => 
          onlineStatusService.isUserOnline(profile.lastActive, profile.isOnline, profile.onlineStatus)
        );
      }

      // Sort by distance (closest first)
      filtered.sort((a, b) => {
        const distanceA = parseFloat((a.distance || '0 km').replace(' km', ''));
        const distanceB = parseFloat((b.distance || '0 km').replace(' km', ''));
        return distanceA - distanceB;
      });

      setFilteredProfiles(filtered);
      setLoading(false);
    } catch (err) {
      console.error('Error filtering profiles:', err);
      setError('Error al cargar los perfiles');
      setFilteredProfiles([]);
      setLoading(false);
    }
  };

  const getProfileImage = (profile) => {
    try {
      return profile?.photos && profile.photos.length > 0 
        ? profile.photos[0] 
        : '/default-avatar.svg';
    } catch (err) {
      console.error('Error getting profile image:', err);
      return '/default-avatar.svg';
    }
  };

  const formatDistance = (distance) => {
    try {
      if (!distance || typeof distance !== 'string') {
        return '0m';
      }
      const km = parseFloat(distance.replace(' km', ''));
      if (isNaN(km)) {
        return '0m';
      }
      if (km < 1) {
        return `${Math.round(km * 1000)}m`;
      }
      return distance;
    } catch (err) {
      console.error('Error formatting distance:', err);
      return '0m';
    }
  };

  if (error) {
    return (
      <div className="profile-grid-empty">
        <div className="empty-icon">⚠️</div>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="load-more-btn" 
          onClick={() => {
            setError(null);
            filterProfiles();
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-grid-loading">
        <div className="loading-spinner"></div>
        <p>Buscando perfiles cercanos...</p>
      </div>
    );
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="profile-grid-empty">
        <div className="empty-icon">🔍</div>
        <h3>No se encontraron perfiles</h3>
        <p>Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="profile-grid-container">
      <div className="profile-grid-header">
        <h2>Perfiles cercanos ({filteredProfiles.length})</h2>
        <div className="header-actions">
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(true)}
          >
            🔍 Filtros
          </button>
          <div className="grid-view-toggle">
            <button className="grid-btn active">⊞</button>
            <button className="list-btn">☰</button>
          </div>
        </div>
      </div>
      
      <div className="profile-grid">
        {filteredProfiles.map((profile) => (
          <div 
            key={profile.id} 
            className={`profile-card ${onlineStatusService.isUserOnline(profile.lastActive, profile.isOnline, profile.onlineStatus) ? 'online' : ''}`}
            onClick={() => onProfileClick(profile)}
          >
            <div className="profile-image-container">
              <img 
                src={getProfileImage(profile)} 
                alt={profile.name}
                className="profile-image"
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
              {onlineStatusService.isUserOnline(profile.lastActive, profile.isOnline, profile.onlineStatus) && (
                <div className="online-indicator"></div>
              )}
              {profile.verified && (
                <div className="verified-badge">
                  <span>✓</span>
                </div>
              )}
              {profile.photos && profile.photos.length > 1 && (
                <div className="photo-count">
                  <span>{profile.photos.length}</span>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <div className="profile-name-age">
                <h3>{profile.name}</h3>
                <span className="age">{profile.age}</span>
              </div>
              
              <div className="profile-distance">
                <span className="distance-icon">📍</span>
                <span>{formatDistance(profile.distance)}</span>
              </div>
              
              <div className="last-seen">
                <span className="last-seen-text">
                  {onlineStatusService.getTimeSinceActive(profile.lastActive)}
                </span>
              </div>
              
              {profile.interests && profile.interests.length > 0 && (
                <div className="profile-interests">
                  {profile.interests.slice(0, 2).map((interest, index) => (
                    <span key={index} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 2 && (
                    <span className="interest-more">+{profile.interests.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="load-more-container">
        <button className="load-more-btn">
          Cargar más perfiles
        </button>
      </div>
      
      {showFilters && (
        <SearchFilters
          searchFilters={searchFilters}
          onFiltersChange={(newFilters) => {
            onFiltersChange(newFilters);
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default ProfileGrid;