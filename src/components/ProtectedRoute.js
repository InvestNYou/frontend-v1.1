import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthService';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { state, actions } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if token exists and is not expired locally
        if (!AuthService.isAuthenticated()) {
          setLoading(false);
          return;
        }

        // Double-check that we have a user in context
        if (!state.user) {
          setLoading(false);
          return;
        }

        // If user is already in context and token is valid, skip backend check
        if (state.user && AuthService.isAuthenticated()) {
          setIsAuthenticated(true);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }

        // Validate token with backend
        const response = await AuthService.validateToken();
        
        if (response.valid && response.user) {
          // Update user context with fresh data
          actions.setUser(response.user);
          actions.setOnboarded(true);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, logout silently on initial load
          AuthService.logout();
          actions.setUser(null);
          actions.setOnboarded(false);
          
          // Only show error message if this is not the initial page load
          if (!isInitialLoad) {
            toast.error('Session expired. Please login again.');
          }
        }
      } catch (error) {
        // Auth check failed - handle silently on initial load
        AuthService.logout();
        actions.setUser(null);
        actions.setOnboarded(false);
        
        // Only show error message if this is not the initial page load
        if (!isInitialLoad) {
          toast.error('Session expired. Please login again.');
        }
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkAuth();
  }, [state.user, actions, isInitialLoad]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
