import React, { useState, useEffect } from 'react';
import './SearchFilters.css';

const SearchFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const orientationOptions = [
    { value: 'all', label: 'Todas las orientaciones' },
    { value: 'gay', label: 'Gay' },
    { value: 'lesbian', label: 'Lesbiana' },
    { value: 'bisexual', label: 'Bisexual' },
    { value: 'pansexual', label: 'Pansexual' },
    { value: 'non-binary', label: 'No binario' },
    { value: 'other', label: 'Otro' }
  ];

  const interestOptions = [
    'Arte', 'Música', 'Deportes', 'Viajes', 'Fotografía', 'Cocina',
    'Lectura', 'Cine', 'Tecnología', 'Fitness', 'Naturaleza', 'Café',
    'Vino', 'Baile', 'Yoga', 'Senderismo', 'Playa', 'Montaña',
    'Mascotas', 'Videojuegos', 'Moda', 'Filosofía', 'Ciencia'
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleAgeRangeChange = (type, value) => {
    const newAgeRange = [...localFilters.ageRange];
    if (type === 'min') {
      newAgeRange[0] = parseInt(value);
    } else {
      newAgeRange[1] = parseInt(value);
    }
    setLocalFilters(prev => ({ ...prev, ageRange: newAgeRange }));
  };

  const handleDistanceChange = (value) => {
    setLocalFilters(prev => ({ ...prev, maxDistance: parseInt(value) }));
  };

  const handleOrientationChange = (value) => {
    setLocalFilters(prev => ({ ...prev, orientation: value }));
  };

  const handleInterestToggle = (interest) => {
    const currentInterests = localFilters.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    setLocalFilters(prev => ({ ...prev, interests: newInterests }));
  };

  const handleOnlineOnlyChange = (checked) => {
    setLocalFilters(prev => ({ ...prev, onlineOnly: checked }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      ageRange: [18, 65],
      maxDistance: 50,
      interests: [],
      orientation: 'all',
      onlineOnly: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.ageRange[0] !== 18 || localFilters.ageRange[1] !== 65) count++;
    if (localFilters.maxDistance !== 50) count++;
    if (localFilters.orientation !== 'all') count++;
    if (localFilters.interests && localFilters.interests.length > 0) count++;
    if (localFilters.onlineOnly) count++;
    return count;
  };

  return (
    <div className="search-filters-overlay" onClick={onClose}>
      <div className="search-filters-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filters-header">
          <h2>Filtros de búsqueda</h2>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="filters-content">
          {/* Age Range Filter */}
          <div className="filter-section">
            <h3>Rango de edad</h3>
            <div className="age-range-container">
              <div className="age-input-group">
                <label>Mínima</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={localFilters.ageRange[0]}
                  onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                  className="age-input"
                />
              </div>
              <span className="age-separator">-</span>
              <div className="age-input-group">
                <label>Máxima</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={localFilters.ageRange[1]}
                  onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                  className="age-input"
                />
              </div>
            </div>
            <div className="range-display">
              {localFilters.ageRange[0]} - {localFilters.ageRange[1]} años
            </div>
          </div>

          {/* Distance Filter */}
          <div className="filter-section">
            <h3>Distancia máxima</h3>
            <div className="distance-slider-container">
              <input
                type="range"
                min="1"
                max="100"
                value={localFilters.maxDistance}
                onChange={(e) => handleDistanceChange(e.target.value)}
                className="distance-slider"
              />
              <div className="distance-display">
                {localFilters.maxDistance} km
              </div>
            </div>
          </div>

          {/* Orientation Filter */}
          <div className="filter-section">
            <h3>Orientación sexual</h3>
            <div className="orientation-options">
              {orientationOptions.map((option) => (
                <label key={option.value} className="orientation-option">
                  <input
                    type="radio"
                    name="orientation"
                    value={option.value}
                    checked={localFilters.orientation === option.value}
                    onChange={(e) => handleOrientationChange(e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  <span className="option-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Online Only Filter */}
          <div className="filter-section">
            <h3>Estado de conexión</h3>
            <div className="online-filter-container">
              <label className="online-checkbox-label">
                <input
                  type="checkbox"
                  checked={localFilters.onlineOnly || false}
                  onChange={(e) => handleOnlineOnlyChange(e.target.checked)}
                  className="online-checkbox"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">
                  <span className="online-indicator-small"></span>
                  Solo mostrar usuarios en línea
                </span>
              </label>
              <p className="filter-description">
                Muestra únicamente usuarios que están activos ahora
              </p>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-toggle">
            <button 
              className="toggle-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Filtros avanzados</span>
              <span className={`toggle-icon ${showAdvanced ? 'open' : ''}`}>▼</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="advanced-filters">
              {/* Interests Filter */}
              <div className="filter-section">
                <h3>Intereses ({localFilters.interests?.length || 0} seleccionados)</h3>
                <div className="interests-grid">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      className={`interest-chip ${
                        localFilters.interests?.includes(interest) ? 'selected' : ''
                      }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="filters-footer">
          <div className="active-filters-count">
            {getActiveFiltersCount() > 0 && (
              <span>{getActiveFiltersCount()} filtro(s) activo(s)</span>
            )}
          </div>
          <div className="filter-actions">
            <button className="reset-btn" onClick={handleResetFilters}>
              Restablecer
            </button>
            <button className="apply-btn" onClick={handleApplyFilters}>
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;