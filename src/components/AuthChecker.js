import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthService';
import toast from 'react-hot-toast';

const AuthChecker = ({ children }) => {
  const { state, actions } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        
        // Check if there's a token in localStorage
        const token = AuthService.getToken();
        
        if (!token) {
          setIsInitialized(true);
          return;
        }

        // Check if token is valid locally first
        if (!AuthService.isAuthenticated()) {
          // Token is expired or malformed, clean up
          AuthService.logout();
          actions.setUser(null);
          actions.setOnboarded(false);
          setIsInitialized(true);
          return;
        }

        // If user is already in context, we're good
        if (state.user) {
          setIsInitialized(true);
          return;
        }

        // Validate token with backend
        const response = await AuthService.validateToken();
        
        if (response.valid && response.user) {
          // Update user context with fresh data
          actions.setUser(response.user);
          actions.setOnboarded(true);
        } else {
          // Token is invalid, clean up
          AuthService.logout();
          actions.setUser(null);
          actions.setOnboarded(false);
        }
      } catch (error) {
        // Clean up on error
        AuthService.logout();
        actions.setUser(null);
        actions.setOnboarded(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [actions]);

  // Show loading screen while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthChecker;
