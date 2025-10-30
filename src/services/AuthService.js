import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('moneysmart-token');
    this.validationInterval = null;
    this.setupAxiosInterceptors();
    this.startPeriodicValidation();
  }

  setupAxiosInterceptors() {
    // Request interceptor to add token to headers
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          // Only redirect if not already on login/signup pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/signup') && 
              !window.location.pathname.includes('/onboarding')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Login user
  async login(email) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email });
      
      if (response.data.token) {
        this.setToken(response.data.token);
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.token) {
        this.setToken(response.data.token);
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      throw error;
    }
  }

  // Guest login
  async guestLogin(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/guest`, userData);
      
      if (response.data.token) {
        this.setToken(response.data.token);
        return response.data;
      }
      throw new Error('No token received');
    } catch (error) {
      throw error;
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Set token
  setToken(token) {
    this.token = token;
    localStorage.setItem('moneysmart-token', token);
  }

  // Get token
  getToken() {
    return this.token || localStorage.getItem('moneysmart-token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      // If token is malformed, remove it
      this.logout();
      return false;
    }
  }

  // Check if user is completely logged out
  isLoggedOut() {
    const token = this.getToken();
    const userData = localStorage.getItem('investnYou-user');
    return !token && !userData;
  }

  // Validate token with backend
  async validateToken() {
    try {
      if (!this.isAuthenticated()) {
        return { valid: false, user: null };
      }
      
      const response = await this.verifyToken();
      return response;
    } catch (error) {
      this.logout();
      return { valid: false, user: null };
    }
  }

  // Start periodic token validation
  startPeriodicValidation() {
    // Clear any existing interval
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }

    // Check token every 5 minutes
    this.validationInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          await this.validateToken();
        } catch (error) {
          this.logout();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop periodic validation
  stopPeriodicValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  // Logout
  logout() {
    
    // Clear token
    this.token = null;
    
    // Stop periodic validation
    this.stopPeriodicValidation();
    
    // Clear all localStorage items related to authentication
    localStorage.removeItem('moneysmart-token');
    localStorage.removeItem('investnYou-user');
    
    // Clear any other potential auth-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('moneysmart')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
  }

  // Get user data from localStorage
  getUserData() {
    const userData = localStorage.getItem('investnYou-user');
    return userData ? JSON.parse(userData) : null;
  }

  // Save user data to localStorage
  saveUserData(userData) {
    localStorage.setItem('investnYou-user', JSON.stringify(userData));
  }
}

export default new AuthService();
