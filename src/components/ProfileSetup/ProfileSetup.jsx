import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './ProfileSetup.css';

function ProfileSetup({ onComplete }) {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    age: 18,
    location: '',
    genderIdentity: 'non_binary',
    sexualOrientation: 'bisexual',
    bio: '',
    interests: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await updateProfile({
        ...profileData,
        age: parseInt(profileData.age),
        profileComplete: true
      });

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const availableInterests = [
    'Música', 'Deportes', 'Arte', 'Viajes', 'Cocina', 'Lectura',
    'Cine', 'Fotografía', 'Baile', 'Tecnología', 'Naturaleza', 'Gaming'
  ];

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h2>Completa tu perfil</h2>
        <p className="setup-subtitle">
          Ayúdanos a conocerte mejor para encontrar mejores conexiones
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input
              type="number"
              name="age"
              value={profileData.age}
              onChange={handleChange}
              min="18"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              required
              placeholder="Ciudad, País"
            />
          </div>

          <div className="form-group">
            <label>Identidad de Género</label>
            <select
              name="genderIdentity"
              value={profileData.genderIdentity}
              onChange={handleChange}
              required
            >
              <option value="non_binary">No binario</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="trans_male">Trans masculino</option>
              <option value="trans_female">Trans femenino</option>
              <option value="genderfluid">Género fluido</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Orientación Sexual</label>
            <select
              name="sexualOrientation"
              value={profileData.sexualOrientation}
              onChange={handleChange}
              required
            >
              <option value="bisexual">Bisexual</option>
              <option value="gay">Gay</option>
              <option value="lesbian">Lesbiana</option>
              <option value="pansexual">Pansexual</option>
              <option value="asexual">Asexual</option>
              <option value="demisexual">Demisexual</option>
              <option value="queer">Queer</option>
              <option value="questioning">Cuestionando</option>
            </select>
          </div>

          <div className="form-group">
            <label>Biografía</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti, tus intereses, lo que buscas..."
              maxLength="500"
              rows="4"
            />
            <small>{profileData.bio.length}/500 caracteres</small>
          </div>

          <div className="form-group">
            <label>Intereses (opcional)</label>
            <div className="interests-grid">
              {availableInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  className={`interest-tag ${
                    profileData.interests.includes(interest) ? 'selected' : ''
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="skip-button"
              onClick={onComplete}
            >
              Saltar por ahora
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Completar perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;