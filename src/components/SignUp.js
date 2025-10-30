import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    ageRange: '',
    financialGoal: '',
    learningMode: 'facts'
  });
  const [loading, setLoading] = useState(false);
  const { actions } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);

      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('moneysmart-token', response.data.token);
        
        // Update user context
        actions.setUser(response.data.user);
        actions.setOnboarded(true);
        
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ageRanges = [
    { value: '13-17', label: '13-17 years' },
    { value: '18-24', label: '18-24 years' },
    { value: '25-34', label: '25-34 years' },
    { value: '35+', label: '35+ years' }
  ];

  const financialGoals = [
    { value: 'college', label: 'Save for College' },
    { value: 'investing', label: 'Start Investing' },
    { value: 'budgeting', label: 'Learn Budgeting' },
    { value: 'retirement', label: 'Plan for Retirement' },
    { value: 'emergency', label: 'Build Emergency Fund' }
  ];

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-logo">
            <img src="/LogoGurt.jpg" alt="InvestNYou Logo" className="signup-logo-img" />
          </div>
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Start your financial literacy journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ageRange" className="form-label">
              Age Range
            </label>
            <select
              id="ageRange"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select your age range</option>
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="financialGoal" className="form-label">
              Primary Financial Goal
            </label>
            <select
              id="financialGoal"
              name="financialGoal"
              value={formData.financialGoal}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select your main goal</option>
              {financialGoals.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="learningMode" className="form-label">
              Learning Preference
            </label>
            <select
              id="learningMode"
              name="learningMode"
              value={formData.learningMode}
              onChange={handleChange}
              className="form-select"
            >
              <option value="facts">Daily Facts & Tips</option>
              <option value="courses">Structured Courses</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`signup-button ${
              loading || !formData.name || !formData.email || !formData.password || !formData.ageRange || !formData.financialGoal
                ? 'secondary'
                : 'primary'
            }`}
          >
            {loading ? (
              <div className="signup-button-content">
                <div className="signup-spinner"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p className="signup-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="signup-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="signup-divider">
          <div className="signup-divider-line">
            <div className="signup-divider-text">
              <span className="signup-divider-span">Or</span>
            </div>
          </div>

          <div className="guest-button">
            <Link
              to="/onboarding"
              className="guest-button-link"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
