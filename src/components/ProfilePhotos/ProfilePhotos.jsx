import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import photoService from '../../services/photoService';
import chatService from '../../services/chatService';
import './ProfilePhotos.css';

const ProfilePhotos = ({ userProfile, onPhotosUpdate }) => {
  const [photos, setPhotos] = useState({
    main: userProfile?.profilePhoto || null,
    additional: userProfile?.additionalPhotos || [],
    private: userProfile?.privateAlbum || []
  });

  // Sync photos state when userProfile changes
  useEffect(() => {
    setPhotos({
      main: userProfile?.profilePhoto || null,
      additional: userProfile?.additionalPhotos || [],
      private: userProfile?.privateAlbum || []
    });
  }, [userProfile]);
  
  const [dragOver, setDragOver] = useState(null);
  const [showPrivateAlbum, setShowPrivateAlbum] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const mainPhotoRef = useRef(null);
  const additionalPhotoRefs = useRef([]);
  const privatePhotoRef = useRef(null);

  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Handle file selection with Firebase Storage upload
  const handleFileSelect = async (files, type, index = null) => {
    const file = files[0];
    if (!file) return;

    // Validar archivo
    const validation = photoService.validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    setUploadProgress({ ...uploadProgress, [`${type}-${index}`]: 0 });

    try {
      // Comprimir imagen si es necesario
      const compressedFile = await photoService.compressImage(file);
      
      // Subir a Firebase Storage
      const uploadResult = await photoService.uploadPhoto(
        compressedFile || file, 
        user.uid, 
        type, 
        index
      );

      if (uploadResult.success) {
        const newPhotos = { ...photos };
        
        if (type === 'main') {
          newPhotos.main = uploadResult.url;
        } else if (type === 'additional') {
          if (index !== null) {
            newPhotos.additional[index] = uploadResult.url;
          } else {
            newPhotos.additional.push(uploadResult.url);
          }
        } else if (type === 'private') {
          newPhotos.private.push(uploadResult.url);
        }
        
        setPhotos(newPhotos);
        onPhotosUpdate && onPhotosUpdate(newPhotos);
      } else {
        alert('Error al subir la foto: ' + uploadResult.error);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
      setUploadProgress({ ...uploadProgress, [`${type}-${index}`]: 100 });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e, type, index = null) => {
    e.preventDefault();
    setDragOver(`${type}-${index}`);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e, type, index = null) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files, type, index);
  };

  // Remove photo
  const removePhoto = (type, index = null) => {
    const newPhotos = { ...photos };
    
    if (type === 'main') {
      newPhotos.main = null;
    } else if (type === 'additional') {
      newPhotos.additional.splice(index, 1);
    } else if (type === 'private') {
      newPhotos.private.splice(index, 1);
    }
    
    setPhotos(newPhotos);
    onPhotosUpdate && onPhotosUpdate(newPhotos);
  };

  // Get user matches for sharing
  const [userMatches, setUserMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load user matches when modal opens
  const loadUserMatches = async () => {
    if (!user?.uid) return;
    
    setLoadingMatches(true);
    try {
      const result = await chatService.getUserMatches(user.uid);
      if (result.success) {
        setUserMatches(result.matches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Share private album via chat
  const sharePrivateAlbum = async () => {
    if (selectedUsers.length === 0 || photos.private.length === 0) {
      alert('Selecciona al menos un usuario para compartir');
      return;
    }

    try {
      // Send album to selected users via chat
      for (const matchId of selectedUsers) {
        await chatService.sendPrivateAlbum(
          matchId,
          user.uid,
          photos.private
        );
      }
      
      alert(`Álbum compartido con ${selectedUsers.length} persona(s)`);
      setShowShareModal(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sharing album:', error);
      alert('Error al compartir el álbum');
    }
  };

  // Open share modal and load matches
  const openShareModal = () => {
    setShowShareModal(true);
    loadUserMatches();
  };

  return (
    <div className="profile-photos">
      <h3>Gestión de Fotos</h3>
      
      {/* Foto Principal */}
      <div className="photo-section">
        <h4>Foto Principal</h4>
        <div 
          className={`photo-upload main-photo ${dragOver === 'main-null' ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'main')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'main')}
          onClick={() => mainPhotoRef.current?.click()}
        >
          {photos.main ? (
            <div className="photo-container">
              <img src={photos.main} alt="Foto principal" />
              <button 
                className="remove-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto('main');
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📷</div>
              <p>Arrastra una foto aquí o haz clic para seleccionar</p>
              <small>Esta será tu foto principal visible para todos</small>
            </div>
          )}
        </div>
        <input
          ref={mainPhotoRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files, 'main')}
        />
      </div>

      {/* Fotos Adicionales */}
      <div className="photo-section">
        <h4>Fotos Adicionales (máximo 4)</h4>
        <div className="additional-photos-grid">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className={`photo-upload additional-photo ${dragOver === `additional-${index}` ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 'additional', index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'additional', index)}
              onClick={() => {
                if (!additionalPhotoRefs.current[index]) {
                  additionalPhotoRefs.current[index] = document.createElement('input');
                  additionalPhotoRefs.current[index].type = 'file';
                  additionalPhotoRefs.current[index].accept = 'image/*';
                  additionalPhotoRefs.current[index].onchange = (e) => 
                    handleFileSelect(e.target.files, 'additional', index);
                }
                additionalPhotoRefs.current[index].click();
              }}
            >
              {photos.additional[index] ? (
                <div className="photo-container">
                  <img src={photos.additional[index]} alt={`Foto adicional ${index + 1}`} />
                  <button 
                    className="remove-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto('additional', index);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder small">
                  <div className="upload-icon">+</div>
                  <small>Foto {index + 1}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Álbum Privado */}
      <div className="photo-section">
        <div className="private-album-header">
          <h4>Álbum Privado 🔒</h4>
          <button 
            className="toggle-private"
            onClick={() => setShowPrivateAlbum(!showPrivateAlbum)}
          >
            {showPrivateAlbum ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        
        {showPrivateAlbum && (
          <>
            <p className="private-album-description">
              Estas fotos solo serán visibles para usuarios específicos que elijas.
            </p>
            
            <div className="private-photos-grid">
              {photos.private.map((photo, index) => (
                <div key={index} className="photo-upload private-photo">
                  <div className="photo-container">
                    <img src={photo} alt={`Foto privada ${index + 1}`} />
                    <button 
                      className="remove-photo"
                      onClick={() => removePhoto('private', index)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              
              <div
                className={`photo-upload private-photo add-private ${dragOver === 'private-null' ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'private')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'private')}
                onClick={() => privatePhotoRef.current?.click()}
              >
                <div className="upload-placeholder small">
                  <div className="upload-icon">+</div>
                  <small>Agregar foto privada</small>
                </div>
              </div>
            </div>
            
            {photos.private.length > 0 && (
              <button 
                className="share-album-btn"
                onClick={openShareModal}
                disabled={uploading}
              >
                📤 Compartir Álbum Privado
              </button>
            )}
          </>
        )}
        
        <input
          ref={privatePhotoRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files, 'private')}
        />
      </div>

      {/* Modal para compartir álbum privado */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="share-modal">
            <h3>Compartir Álbum Privado</h3>
            <p>Selecciona con quién quieres compartir tu álbum privado:</p>
            
            <div className="users-list">
              {loadingMatches ? (
                <div className="loading-matches">
                  <p>Cargando tus matches...</p>
                </div>
              ) : userMatches.length > 0 ? (
                userMatches.map((match) => (
                  <div key={match.id} className="user-item">
                    <input
                      type="checkbox"
                      id={match.id}
                      checked={selectedUsers.includes(match.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, match.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== match.id));
                        }
                      }}
                    />
                    <label htmlFor={match.id}>
                      <div className="user-info">
                        {match.profilePhoto && (
                          <img 
                            src={match.profilePhoto} 
                            alt={match.name}
                            className="user-avatar"
                          />
                        )}
                        <div>
                          <div className="user-name">{match.name}</div>
                          <small className="user-last-message">{match.lastMessage}</small>
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="no-matches">
                  <p>No tienes matches disponibles para compartir.</p>
                  <small>Conecta con más personas para poder compartir tu álbum privado.</small>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedUsers([]);
                }}
              >
                Cancelar
              </button>
              <button 
                className="share-btn"
                onClick={sharePrivateAlbum}
              >
                Compartir ({selectedUsers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotos;