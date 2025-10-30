import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthService';

const AuthGuard = ({ children }) => {
  const { state } = useUser();
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is authenticated
        if (AuthService.isAuthenticated() && state.user) {
          // User is authenticated, redirect to dashboard
          setShouldRedirect(true);
        } else {
          // User is not authenticated, allow access to auth pages
          setShouldRedirect(false);
        }
      } catch (error) {
        // Auth check failed
        setShouldRedirect(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [state.user]);

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

  if (shouldRedirect) {
    // Redirect authenticated users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthGuard;
