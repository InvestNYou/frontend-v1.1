import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthService';
import { FaPiggyBank, FaGraduationCap, FaChartLine, FaQuestionCircle } from 'react-icons/fa';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { state, actions } = useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (AuthService.isAuthenticated() && state.user) {
      navigate('/dashboard');
    }
  }, [state.user, navigate]);

  const handleGetStarted = async () => {
    // Create guest user directly without onboarding
    try {
      const response = await AuthService.guestLogin({
        name: 'Guest User',
        ageRange: '18-24',
        financialGoal: 'investing',
        learningMode: 'facts'
      });
        
      // Store token and user data
      AuthService.setToken(response.token);
      AuthService.saveUserData(response.user);
      
      // Set user in context and navigate to dashboard
      actions.setUser(response.user);
      actions.setOnboarded(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create guest user:', error);
      // Handle error appropriately - maybe show a toast or redirect to login
    }
  };

  const handleLogIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="welcome-container">
      {/* Background Pattern */}
      <div className="welcome-background">
        <div className="welcome-background-circle large"></div>
        <div className="welcome-background-circle large bottom"></div>
        <div className="welcome-background-circle center"></div>
        
        {/* Mobile-friendly background elements */}
        <div className="welcome-background-circle mobile top"></div>
        <div className="welcome-background-circle mobile bottom"></div>
      </div>

      <div className="welcome-content">
        {/* Logo and Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="welcome-logo"
        >
          <div className="welcome-mascot">
            <img src="/LogoGurt.jpg" alt="InvestNYou Logo" className="welcome-logo-img" />
          </div>
          <h1 className="welcome-title">
            InvestNYou
          </h1>
          <p className="welcome-subtitle">
            Master your finances, one fact at a time
          </p>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="welcome-message"
        >
          <h2>Welcome to InvestNYou!</h2>
          <p>
            Learn to master your finances through daily facts, structured lessons, 
            and AI-powered guidance. Perfect for teens and young adults.
          </p>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="welcome-features"
        >
          <div className="welcome-feature">
            <FaGraduationCap className="welcome-feature-icon" />
            <span className="welcome-feature-text">Daily Facts</span>
          </div>
          <div className="welcome-feature">
            <FaChartLine className="welcome-feature-icon" />
            <span className="welcome-feature-text">Portfolio Sim</span>
          </div>
          <div className="welcome-feature">
            <FaPiggyBank className="welcome-feature-icon" />
            <span className="welcome-feature-text">Smart Saving</span>
          </div>
          <div className="welcome-feature">
            <FaQuestionCircle className="welcome-feature-icon" />
            <span className="welcome-feature-text">AI Assistant</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="welcome-buttons"
        >
          <button
            onClick={handleGetStarted}
            className="welcome-button-primary"
          >
            Get Started as Guest
          </button>
          
          <div className="welcome-button-row">
            <button
              onClick={handleSignUp}
              className="welcome-button-secondary"
            >
              Sign Up
            </button>
            
            <button
              onClick={handleLogIn}
              className="welcome-button-secondary"
            >
              Log In
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="welcome-footer"
        >
          <p className="welcome-footer-text">
            Start your financial journey today
          </p>
          <div className="welcome-footer-links">
            <Link 
              to="/terms" 
              className="welcome-footer-link"
            >
              Terms of Service
            </Link>
            <Link 
              to="/privacy" 
              className="welcome-footer-link"
            >
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
