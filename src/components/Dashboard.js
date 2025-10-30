import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaFire, FaTrophy, FaCoins, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthService from '../services/AuthService';
import FactsService from '../services/FactsService';
import ProgressService from '../services/ProgressService';
import { getLevelTitle, getLevelProgress } from '../utils/levelUtils';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { state, actions } = useUser();
  const [dailyFact, setDailyFact] = useState(null);
  const [factCompleted, setFactCompleted] = useState(false);
  const [canCompleteToday, setCanCompleteToday] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        const token = localStorage.getItem('moneysmart-token');
        
        // Check if user is authenticated
        const isAuth = AuthService.isAuthenticated();
        
        if (!isAuth) {
          navigate('/login', { replace: true });
          return;
        }

        // Check if user exists in context
        
        if (!state.user) {
          navigate('/login', { replace: true });
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, state.user]);

  // Auto-sync functionality
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoSync = async (showNotification = false) => {
      try {
        const success = await actions.syncWithBackend();
        if (success) {
          setLastSyncTime(new Date());
          if (showNotification) {
            toast.success('Data synced automatically!', { duration: 2000 });
          }
        } else {
          if (showNotification) {
            toast.error('Sync failed, using cached data', { duration: 2000 });
          }
        }
      } catch (error) {
        if (showNotification) {
          toast.error('Sync error occurred', { duration: 2000 });
        }
      }
    };

    // Initial sync when component mounts
    autoSync();

    // Set up periodic auto-sync every 5 minutes
    const syncInterval = setInterval(autoSync, 5 * 60 * 1000);

    // Set up visibility change sync (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        autoSync(true); // Show notification when returning to tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up focus sync (when user returns to window)
    const handleFocus = () => {
      autoSync(true); // Show notification when window gains focus
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, actions]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadTodaysFact = async () => {
      try {
        const response = await FactsService.getTodaysFact();
        
        if (response.fact) {
          const fact = response.fact;
          // Check if the fact is already completed and if user can complete today
          const isCompleted = fact.isCompleted || false;
          const canComplete = fact.canCompleteToday !== false;
          
          setDailyFact(fact);
          setFactCompleted(isCompleted);
          setCanCompleteToday(canComplete);
          actions.setDailyFact(fact);
          
        } else {
          toast.error('Failed to load today\'s fact');
        }
      } catch (error) {
        toast.error('Failed to load today\'s fact');
        
        // Fallback to a default fact if backend fails
        const fallbackFact = {
          id: 1,
          title: "Welcome to InvestNYou!",
          content: "Start your financial journey by learning about investing, budgeting, and building wealth. Complete daily facts to earn XP and level up!",
          category: "Getting Started",
          xpValue: 25,
          isCompleted: false
        };
        setDailyFact(fallbackFact);
        actions.setDailyFact(fallbackFact);
      }
    };

    loadTodaysFact();
  }, [isAuthenticated, actions]);

  const handleFactComplete = async () => {
    if (!dailyFact || factCompleted || !canCompleteToday) return;

    try {
      const response = await ProgressService.completeFact(dailyFact.id);
      
      if (response.xpEarned) {
        setFactCompleted(true);
        setCanCompleteToday(false);
        toast.success(`+${response.xpEarned} XP earned!`);
        
        // Auto-sync with backend to get the latest data
        const syncSuccess = await actions.syncWithBackend();
        
        if (syncSuccess) {
          setLastSyncTime(new Date());
        } else {
          // Fallback: update local state if sync fails
          actions.completeFact(dailyFact.id);
          actions.addXp(response.xpEarned);
        }
        
        // Check if user leveled up
        if (response.newLevel > state.progress?.level) {
          toast.success(`🎉 Level Up! You're now level ${response.newLevel}!`);
        }
        
        // Show streak update
        if (response.newStreak) {
          toast.success(`🔥 ${response.newStreak} day streak!`);
        }
        
        // Show badge unlock if any
        if (response.badgeUnlocked) {
          toast.success(`🏆 Badge unlocked: ${response.badgeUnlocked.name}!`);
        }
        
      }
    } catch (error) {
      if (error.message.includes('one fact per day')) {
        toast.error('You can only complete one fact per day!');
        setCanCompleteToday(false);
      } else {
        toast.error('Failed to complete fact. Please try again.');
      }
    }
  };



  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to log out?');
    
    if (!confirmed) {
      return;
    }
    
    // User confirmed logout, clearing all data
    
    // Clear all authentication data
    AuthService.logout();
    
    // Clear user context completely
    actions.setUser(null);
    actions.setOnboarded(false);
    
    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Force redirect to landing page
    navigate('/', { replace: true });
    
    // Force page reload to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="dashboard-container content-with-nav">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-left">
            <div className="logo-container">
              <img src="/LogoGurt.jpg" alt="InvestNYou Logo" className="logo-img" />
            </div>
            <h1 className="app-title">InvestNYou</h1>
          </div>
          
          <div className="top-bar-right">
            <div className="user-info">
              <div className="user-level">
                Level {state.progress.level}
              </div>
              <div className="user-title">
                {getLevelTitle(state.progress.level)}
              </div>
            </div>
            <div className="trophy-icon">
              <FaTrophy />
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="greeting-section"
        >
          <h2 className="greeting-title">
            Hey {state.user?.name || 'Guest'}! 👋
          </h2>
          <p className="greeting-subtitle">Here's your daily fact!</p>
        </motion.div>

        {/* Progress Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="progress-card"
        >
          <div className="progress-header">
            <div className="streak-info">
              <FaFire className="streak-icon" />
              <span className="streak-text">{state.progress.streak} day streak!</span>
            </div>
            <div className="xp-info">
              <FaCoins className="xp-icon" />
              <span className="xp-text">{state.progress.xp} XP</span>
            </div>
            {lastSyncTime && (
              <div className="sync-info" title={`Last synced: ${lastSyncTime.toLocaleTimeString()}`}>
                <div className="sync-indicator">
                  <div className="sync-dot"></div>
                  <span>Auto-synced</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${getLevelProgress(state.progress.xp, state.progress.level).progressPercentage}%`
              }}
            />
          </div>
          <div className="progress-text">
            {getLevelProgress(state.progress.xp, state.progress.level).xpNeededForNext} XP to next level
            <br />
            {/* <span className="text-xs text-blue-500">
              Debug: {getLevelProgress(state.progress.xp, state.progress.level).progressPercentage.toFixed(1)}% progress
            </span> */}
          </div>
        </motion.div>

        {/* Daily Fact Card */}
        {dailyFact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`fact-card ${factCompleted ? 'completed' : ''}`}
          >
            <div className="fact-card-content">
              <div className="fact-category">
                {dailyFact.category}
              </div>
              <h3 className="fact-title">
                {dailyFact.title}
              </h3>
              <p className="fact-content">
                {dailyFact.content}
              </p>
            </div>

            {!factCompleted && canCompleteToday && (
              <div className="mt-6">
                <button
                  onClick={handleFactComplete}
                  className="fact-button"
                >
                  Got it! +{dailyFact.xpValue || dailyFact.xp} XP
                </button>
              </div>
            )}

            {!canCompleteToday && !factCompleted && (
              <div className="fact-completed-message">
                <div className="fact-completed-content">
                  <p className="fact-completed-text">
                    ⏰ You've already completed your daily fact today!
                  </p>
                  <p className="fact-completed-subtext">
                    Come back tomorrow for a new fact and to continue your streak!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Daily Fact Completed Message */}
        {factCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="completed-fact-card"
          >
            <div className="completed-fact-content">
              <div className="completed-icon-container">
                <FaCheckCircle className="completed-icon" />
              </div>
              <h3 className="completed-title">
                Daily Fact Completed! 🎉
              </h3>
              <p className="completed-text">
                Great job! Come back tomorrow for your next daily fact.
              </p>
              {state.progress.streak > 1 && (
                <div className="streak-card">
                  <p className="streak-text-completed">
                    🔥 {state.progress.streak} day streak!
                  </p>
                  <p className="streak-subtext">
                    Keep it up to unlock special badges!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="quick-actions"
        >
          <button
            onClick={() => navigate('/learn')}
            className="action-button"
          >
            <FaGraduationCap className="action-icon learn" />
            <h3 className="action-title">Start Learning</h3>
            <p className="action-subtitle">Explore courses</p>
          </button>

          <button
            onClick={() => navigate('/ask')}
            className="action-button"
          >
            <FaQuestionCircle className="action-icon ask" />
            <h3 className="action-title">Ask Question</h3>
            <p className="action-subtitle">Get instant help</p>
          </button>
        </motion.div>

        {/* Badges */}
        {state.progress.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="badges-card"
          >
            <h3 className="badges-title">Your Badges</h3>
            <div className="badges-list">
              {state.progress.badges.map((badge) => (
                <div key={badge.id} className="badge-item">
                  <FaTrophy className="badge-icon" />
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="nav-bottom">
        <button className="nav-item active">
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/learn')} className="nav-item">
          <FaGraduationCap className="text-xl mb-1" />
          <span>Learn</span>
        </button>
        <button onClick={() => navigate('/ask')} className="nav-item">
          <FaQuestionCircle className="text-xl mb-1" />
          <span>Ask</span>
        </button>
        <button onClick={() => navigate('/portfolio')} className="nav-item">
          <FaChartLine className="text-xl mb-1" />
          <span>Portfolio</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
