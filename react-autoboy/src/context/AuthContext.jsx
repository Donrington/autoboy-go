import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const cachedUser = localStorage.getItem('user');

    if (token && cachedUser) {
      // User has token and cached data - immediately authenticate
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false); // ✅ Set loading to false immediately for instant access

        // Optionally fetch fresh user profile in background (don't block UI)
        fetchUserProfile().catch(() => {
          console.log('Using cached user data');
        });
      } catch (e) {
        console.error('Error parsing cached user:', e);
        // If cache is corrupted, fetch fresh
        fetchUserProfile();
      }
    } else if (token) {
      // Has token but no cached user - fetch from API
      fetchUserProfile();
    } else {
      // No token - not authenticated
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      // Handle Go backend response format: { success: true, data: { user: {...} } }
      const userData = response.data?.user || response.data || response;
      setUser(userData);
      setIsAuthenticated(true);
      // Cache user data
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
    } catch (error) {
      console.error('Profile fetch error:', error);

      // ⚠️ TEMPORARY: Don't logout on background refresh failures
      // Only logout if this is the initial auth check (no cached user)
      const cachedUser = localStorage.getItem('user');
      if (!cachedUser) {
        // No cached user - this is a real auth failure
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Has cached user - keep using it, just log the error
        console.warn('Using cached user data due to backend auth error');
      }
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Handle Go backend response format: { success: true, data: { token, user } }
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Handle Go backend response format: { success: true, data: { token, user } }
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login page after logout
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refetchUser: fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};