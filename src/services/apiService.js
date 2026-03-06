/**
 * API Service Layer
 * Centralized place to handle all HTTP requests to the backend
 * Uses axios for HTTP client with built-in token management
 */

import axios from 'axios';

// Get the backend URL from environment or use localhost as fallback
const API_URL = import.meta.env.VITE_API_URL ;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in every request
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log API requests for debugging
    if (config.url.includes('/ai/session/')) {
      console.log('📤 AI API Request:', config.method?.toUpperCase(), config.url, 'Payload:', config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, token might be expired - clear it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ========== Authentication Endpoints ========== */
export const authAPI = {
  // Register new user
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // Login user
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  
  // Get current user profile
  getProfile: () => apiClient.get('/auth/me'),
  
  // Update user profile
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
};

/* ========== Mentor Endpoints ========== */
export const mentorAPI = {
  // Search mentors by skill
  searchMentors: (skill) => apiClient.get(`/mentors/match?skill=${skill}`),
  
  // Get specific mentor profile
  getMentorProfile: (mentorId) => apiClient.get(`/mentors/${mentorId}`),
  
  // Get mentor availability
  getMentorAvailability: (mentorId, date) => 
    apiClient.get(`/mentors/availability/${mentorId}?date=${date}`),
};

/* ========== Session Endpoints ========== */
export const sessionAPI = {
  // Book a new session with a mentor
  bookSession: (sessionData) => apiClient.post('/sessions', sessionData),
  
  // Get all user's sessions
  getMySessions: () => apiClient.get('/sessions/my'),
  
  // Get specific session
  getSession: (sessionId) => apiClient.get(`/sessions/${sessionId}`),
  
  // Update session status (completed, cancelled, etc.)
  updateSessionStatus: (sessionId, status) => 
    apiClient.patch(`/sessions/${sessionId}/status`, { status }),
  
  // Cancel a session
  cancelSession: (sessionId) => apiClient.patch(`/sessions/${sessionId}/cancel`),
};

/* ========== Rating Endpoints ========== */
export const ratingAPI = {
  // Submit rating after session
  submitRating: (sessionId, ratingData) => 
    apiClient.post(`/ratings`, { sessionId, ...ratingData }),
  
  // Get ratings for a user
  getUserRatings: (userId) => apiClient.get(`/ratings/user/${userId}`),
};

/* ========== Leaderboard Endpoints ========== */
export const leaderboardAPI = {
  // Get top mentors by badge score
  getTopMentors: (limit = 10) => 
    apiClient.get(`/leaderboard/mentors?limit=${limit}`),
  
  // Get user's rank
  getUserRank: (userId) => apiClient.get(`/leaderboard/rank/${userId}`),
};

/* ========== AI Tutor Endpoints ========== */
export const aiTutorAPI = {
  // Start AI tutor session
  startSession: (skill) => apiClient.post('/ai/session', { skill }),
  
  // End AI session
  endSession: (sessionId) => apiClient.post('/ai/end-session', { sessionId }),
  
  // Check AI usage and trial status
  checkAIStatus: () => apiClient.get('/ai/status'),
};

export default apiClient;
