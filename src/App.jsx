import React, { useState, useEffect } from 'react';
import Chat from './components/Chat/Chat';
import ProfileGrid from './components/ProfileGrid/ProfileGrid';
import ProfileDetail from './components/ProfileDetail/ProfileDetail';
import SearchFilters from './components/SearchFilters/SearchFilters';
import ProfilePhotos from './components/ProfilePhotos/ProfilePhotos';
import ProfileSetup from './components/ProfileSetup/ProfileSetup';
import { useAuth } from './hooks/useAuth';
import matchService from './services/matchService';
import chatService from './services/chatService';
import onlineStatusService from './services/onlineStatusService';
import './App.css';
import './components/ProfilePreview/ProfilePreview.css';

function App() {
  // Firebase Authentication Hook
  const { user, loading, error: authError, login, register, registerWithGoogle, registerWithFacebook, logout, updateProfile, isAuthenticated } = useAuth();
  
  const [language, setLanguage] = useState('en');
  const [darkMode] = useState(true);
  const [currentView, setCurrentView] = useState('login');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [discoveryUsers, setDiscoveryUsers] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    ageRange: [18, 65],
    maxDistance: 50,
    interests: [],
    orientation: 'all',
    onlineOnly: false
  });
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    location: '',
    genderIdentity: '',
    sexualOrientation: '',
    bio: '',
    interests: []
  });
  const [receivedHearts, setReceivedHearts] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  // Translations
  const translations = {
    en: {
      welcome: 'Welcome to Tingay',
      tagline: 'Connect with the LGBTQ+ community',
      explore: 'Explore Matches',
      profile: 'Profile',
      matches: 'Matches',
      chat: 'Messages',
      settings: 'Settings',
      language: 'Language',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      name: 'Name',
      age: 'Age',
      location: 'Location',
      genderIdentity: 'Gender Identity',
      sexualOrientation: 'Sexual Orientation',
      bio: 'Bio',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
      loginNow: 'Login now',
      registerNow: 'Register now',
      loginError: 'Invalid email or password',
      registerError: 'Error creating account',
      passwordMismatch: 'Passwords do not match'
    },
    es: {
      welcome: 'Bienvenido a Tingay',
      tagline: 'Conecta con la comunidad LGBTQ+',
      explore: 'Explorar',
      profile: 'Perfil',
      matches: 'Matches',
      chat: 'Mensajes',
      settings: 'Configuración',
      language: 'Idioma',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      email: 'Correo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      username: 'Usuario',
      name: 'Nombre',
      age: 'Edad',
      location: 'Ubicación',
      genderIdentity: 'Identidad de Género',
      sexualOrientation: 'Orientación Sexual',
      bio: 'Biografía',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tienes cuenta?',
      dontHaveAccount: '¿No tienes cuenta?',
      loginNow: 'Inicia sesión',
      registerNow: 'Regístrate',
      loginError: 'Email o contraseña inválidos',
      registerError: 'Error al crear cuenta',
      passwordMismatch: 'Las contraseñas no coinciden'
    }
  };

  const t = translations[language];
  
  // Effect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
      // Initialize online status service
      onlineStatusService.initialize(user.uid);
      
      // Check if user needs to complete profile setup
      if (user.profileComplete === false) {
        setCurrentView('profile-setup');
      } else {
        setCurrentView('grid');
        loadDiscoveryUsers();
      }
    } else if (!loading && !isAuthenticated) {
      setCurrentView('login');
      // Stop online status service when user logs out
      onlineStatusService.stopHeartbeat();
    }
  }, [isAuthenticated, user, loading]);
  
  // Reload discovery users when search filters change
  useEffect(() => {
    if (isAuthenticated && user && currentView === 'grid') {
      loadDiscoveryUsers();
    }
  }, [searchFilters]);
  
  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
    setRegisterData(prev => ({
      ...prev,
      preferredLanguage: language === 'en' ? 'es' : 'en'
    }));
  };

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Handle register form changes
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError(t.loginError);
      return;
    }
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      setCurrentView('grid');
      // Initialize geolocation after successful login
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } else {
      setError(result.error || t.loginError);
    }
  };
  
  // Handle register submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError(t.registerError || 'Please fill in all required fields');
      return;
    }
    
    const result = await register({
      email: registerData.email,
      password: registerData.password,
      username: registerData.username
    });
    
    if (result.success) {
      // New users need to complete profile setup
      setCurrentView('profile-setup');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } else {
      setError(result.error || t.registerError || 'Registration failed');
    }
  };

  // Handle Google registration
  const handleGoogleRegister = async () => {
    setError('');
    const result = await registerWithGoogle();
    
    if (result.success) {
      // Check if user needs to complete profile setup
      if (result.user && result.user.profileComplete === false) {
        setCurrentView('profile-setup');
      } else {
        setCurrentView('grid');
      }
      // Initialize geolocation after successful registration
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } else {
      setError(result.error || 'Error al registrarse con Google');
    }
  };

  // Handle Facebook registration
  const handleFacebookRegister = async () => {
    setError('');
    const result = await registerWithFacebook();
    
    if (result.success) {
      // Check if user needs to complete profile setup
      if (result.user && result.user.profileComplete === false) {
        setCurrentView('profile-setup');
      } else {
        setCurrentView('grid');
      }
      // Initialize geolocation after successful registration
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } else {
      setError(result.error || 'Error al registrarse con Facebook');
    }
  };

  // Load user profile
  const loadUserProfile = () => {
    if (user) {
      setProfileData({
        name: user.displayName || user.name || '',
        age: user.age || '',
        location: user.location || '',
        genderIdentity: user.genderIdentity || '',
        sexualOrientation: user.sexualOrientation || '',
        bio: user.bio || '',
        interests: user.interests || []
      });
    }
  };

  // Load discovery users
  const loadDiscoveryUsers = async () => {
    if (user) {
      const result = await matchService.getProfilesToShow(user.uid, searchFilters);
      if (result.success) {
        setDiscoveryUsers(result.profiles);
      }
    }
  };

  // Handle like
  const handleLike = async (profileId) => {
    const result = await matchService.sendHeart(user.uid, profileId);
    
    if (result.success && result.isMatch) {
      alert('¡Es un match! 🎉');
    }
    
    if (!result.success) {
      console.error('Error sending heart:', result.error);
    }
  };

  // Handle pass
  const handlePass = async (profileId) => {
    const result = await matchService.passProfile(user.uid, profileId);
    
    if (!result.success) {
      console.error('Error passing profile:', result.error);
    }
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      alert('Perfil actualizado exitosamente!');
    } else {
      setError(result.error || 'Error updating profile');
    }
  };

  // Handle profile change
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();
    
    if (result.success) {
      setCurrentView('login');
      setDiscoveryUsers([]);
      setSelectedProfile(null);
      setUserLocation(null);
      setSearchFilters({
        ageRange: [18, 65],
        maxDistance: 50,
        interests: [],
        orientation: 'all'
      });
    }
  };

  // Render navigation
  const renderNavigation = () => (
    isAuthenticated ? (
    <nav className="app-navigation">
      <button onClick={() => setCurrentView('grid')} className={currentView === 'grid' || currentView === 'profile-detail' ? 'active' : ''}>
        Explorar
      </button>
      <button onClick={() => setCurrentView('hearts')} className={currentView === 'hearts' ? 'active' : ''}>
        💖 Corazones
        {receivedHearts.filter(h => !h.seen).length > 0 && (
          <span className="notification-badge">{receivedHearts.filter(h => !h.seen).length}</span>
        )}
      </button>
      <button onClick={() => setCurrentView('chat')} className={currentView === 'chat' ? 'active' : ''}>
        {t.chat}
        {unreadMessages > 0 && (
          <span className="notification-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
        )}
      </button>
      <button onClick={() => setCurrentView('profile')} className={currentView === 'profile' ? 'active' : ''}>
        {t.profile}
      </button>
      <button onClick={() => setCurrentView('settings')} className={currentView === 'settings' ? 'active' : ''}>
        {t.settings}
      </button>
    </nav>
  ) : null);

  // Render current view
  const renderView = () => {
    if (!isAuthenticated) {
      if (currentView === 'login') {
        return (
          <div className="auth-container">
            <div className="auth-card">
              <h2>{t.login}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>{t.email}</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={loginData.email} 
                    onChange={handleLoginChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.password}</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={loginData.password} 
                    onChange={handleLoginChange} 
                    required 
                  />
                </div>
                <button type="submit" className="save-button">{t.login}</button>
              </form>
              <p className="auth-switch">
                {t.dontHaveAccount} <button onClick={() => setCurrentView('register')}>{t.registerNow}</button>
              </p>
            </div>
          </div>
        );
      } else if (currentView === 'register') {
        return (
          <div className="auth-container">
            <div className="auth-card">
              <h2>{t.register}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>{t.username}</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={registerData.username} 
                    onChange={handleRegisterChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.email}</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={registerData.email} 
                    onChange={handleRegisterChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.password}</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={registerData.password} 
                    onChange={handleRegisterChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.confirmPassword}</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={registerData.confirmPassword} 
                    onChange={handleRegisterChange} 
                    required 
                  />
                </div>
                <button type="submit" className="save-button">{t.createAccount}</button>
              </form>
              
              <div className="social-auth">
                <div className="divider">
                  <span>o</span>
                </div>
                <button 
                  type="button" 
                  className="google-button" 
                  onClick={handleGoogleRegister}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>
                <button 
                  type="button" 
                  className="facebook-button" 
                  onClick={handleFacebookRegister}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar con Facebook
                </button>
              </div>
              <p className="auth-switch">
                {t.alreadyHaveAccount} <button onClick={() => setCurrentView('login')}>{t.loginNow}</button>
              </p>
            </div>
          </div>
        );
      }
    }

    // Authenticated views
    switch(currentView) {
      case 'grid':
        return (
          <ProfileGrid 
            profiles={discoveryUsers}
            onProfileClick={(profile) => {
              setSelectedProfile(profile);
              setCurrentView('profile-detail');
            }}
            searchFilters={searchFilters}
            userLocation={userLocation}
            onFiltersChange={setSearchFilters}
          />
        );
        
      case 'profile-detail':
        return (
          <ProfileDetail 
            profile={selectedProfile}
            onBack={() => setCurrentView('grid')}
            onLike={() => handleLike(selectedProfile.id)}
            onPass={() => handlePass(selectedProfile.id)}
          />
        );
        
      case 'profile':
        return (
          <div className="profile-edit-view">
            <h2>Mi Perfil</h2>
            
            {/* Vista previa del perfil */}
            <div className="profile-preview-section">
              <h3>Vista previa de tu perfil</h3>
              <div className="profile-preview-card">
                <div className="preview-photo-container">
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Tu foto principal" 
                      className="preview-main-photo"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <span>📷</span>
                      <p>Sin foto principal</p>
                    </div>
                  )}
                </div>
                <div className="preview-info">
                  <h4>{user?.name || 'Tu nombre'}</h4>
                  <p>{user?.age ? `${user.age} años` : 'Edad no especificada'}</p>
                  <p>{user?.location || 'Ubicación no especificada'}</p>
                  <p>{user?.bio || 'Sin biografía'}</p>
                  {user?.additionalPhotos && user.additionalPhotos.length > 0 && (
                    <div className="preview-additional-photos">
                      <small>{user.additionalPhotos.length} fotos adicionales</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Gestión de Fotos */}
            <ProfilePhotos 
              userProfile={user}
              onPhotosUpdate={(photos) => {
                // Update user profile with new photos
                updateProfile({
                  profilePhoto: photos.main,
                  additionalPhotos: photos.additional,
                  privateAlbum: photos.private
                });
              }}
            />
            
            {/* Información del Perfil */}
            <div className="profile-info-section">
              <h3>Información Personal</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>{t.name}</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleProfileChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.age}</label>
                  <input 
                    type="number" 
                    name="age" 
                    value={profileData.age} 
                    onChange={handleProfileChange}
                    min="18" 
                    max="100" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.location}</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={profileData.location} 
                    onChange={handleProfileChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>{t.bio}</label>
                  <textarea 
                    name="bio"
                    value={profileData.bio} 
                    onChange={handleProfileChange}
                    placeholder="Cuéntanos sobre ti..."
                    maxLength="500"
                    rows="4"
                  ></textarea>
                  <small>{profileData.bio.length}/500 caracteres</small>
                </div>
                <button type="submit" className="save-button">
                  Guardar Perfil
                </button>
              </form>
            </div>
          </div>
        );

      case 'chat':
        return (
          <Chat 
            user={user} 
            selectedProfile={selectedProfile}
            onUnreadMessagesChange={setUnreadMessages}
          />
        );
        
      case 'profile-setup':
        return (
          <ProfileSetup 
            user={user}
            onComplete={() => {
              setCurrentView('grid');
              loadDiscoveryUsers();
            }}
          />
        );
        
      case 'settings':
        return (
          <div className="settings-view">
            <h2>{t.settings}</h2>
            <div className="settings-section">
              <h3>{t.language}</h3>
              <button onClick={toggleLanguage} className="language-toggle">
                {language === 'en' ? 'Español' : 'English'}
              </button>
            </div>
            
            <div className="settings-section">
              <h3>Cuenta</h3>
              <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Page not found</div>;
    }
  };

  // Show loading screen while Firebase initializes
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  // Show auth error if exists
  if (authError) {
    return (
      <div className="error-screen">
        <h2>Error de Autenticación</h2>
        <p>{authError}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <h1>{t.welcome}</h1>
        <p>{t.tagline}</p>
      </header>
      
      {renderNavigation()}
      
      <main className="app-content">
        {renderView()}
      </main>
      
      <footer className="app-footer">
        <p>© 2023 Tingay - LGBTQ+ Dating App</p>
      </footer>
    </div>
  );
}

export default App;