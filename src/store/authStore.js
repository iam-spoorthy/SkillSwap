/**
 * Auth Store (Zustand)
 * Centralized state management for authentication
 * Handles login, logout, and user profile data
 */

import { create } from 'zustand';
import { authAPI } from '../services/apiService';

export const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticating: false,
  error: null,

  // Actions
  
  // Login: Send credentials to backend and store token + user data
  login: async (email, password) => {
    set({ isAuthenticating: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticating: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isAuthenticating: false });
      return { success: false, error: errorMsg };
    }
  },

  // Register: Create new user account
  register: async (userData) => {
    set({ isAuthenticating: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticating: false });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg, isAuthenticating: false });
      return { success: false, error: errorMsg };
    }
  },

  // Logout: Clear user data and token
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      const updatedUser = response.data;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Update failed';
      set({ error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));
