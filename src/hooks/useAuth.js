import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado, obtener perfil completo
        const profileResult = await authService.getUserProfile(firebaseUser.uid);
        
        if (profileResult.success) {
          setUser(profileResult.user);
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName
          });
        }
      } else {
        // Usuario no autenticado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    const result = await authService.login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        // El usuario se establecerá automáticamente por onAuthStateChanged
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const registerWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.registerWithGoogle();
      
      if (result.success) {
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const registerWithFacebook = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.registerWithFacebook();
      
      if (result.success) {
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const result = await authService.logout();
    setLoading(false);
    return result;
  };

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    const result = await authService.updateUserProfile(user.uid, profileData);
    
    if (result.success) {
      // Actualizar estado local
      setUser(prev => ({ ...prev, ...profileData }));
    }
    
    return result;
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    registerWithGoogle,
    registerWithFacebook,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };
};

export default useAuth;