import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const UserContext = createContext();

// Initial state
const initialState = {
  user: null,
  isOnboarded: false,
  preferences: {
    learningMode: 'facts', // 'facts' or 'courses'
    notifications: true,
    dailyFactTime: '08:00'
  },
  progress: {
    level: 1,
    xp: 0,
    streak: 0,
    badges: [],
    completedFacts: [],
    completedLessons: []
  },
  dailyFact: null,
  portfolio: {
    balance: 10000,
    stocks: [],
    transactions: []
  }
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_ONBOARDED: 'SET_ONBOARDED',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  ADD_XP: 'ADD_XP',
  ADD_BADGE: 'ADD_BADGE',
  COMPLETE_FACT: 'COMPLETE_FACT',
  COMPLETE_LESSON: 'COMPLETE_LESSON',
  UPDATE_STREAK: 'UPDATE_STREAK',
  SET_DAILY_FACT: 'SET_DAILY_FACT',
  UPDATE_PORTFOLIO: 'UPDATE_PORTFOLIO'
};

// Reducer
function userReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case ActionTypes.SET_ONBOARDED:
      return {
        ...state,
        isOnboarded: action.payload
      };
    
    case ActionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case ActionTypes.ADD_XP:
      const newXp = state.progress.xp + action.payload;
      const newLevel = Math.floor(newXp / 100) + 1;
      return {
        ...state,
        progress: {
          ...state.progress,
          xp: newXp,
          level: newLevel
        }
      };
    
    case ActionTypes.ADD_BADGE:
      return {
        ...state,
        progress: {
          ...state.progress,
          badges: [...state.progress.badges, action.payload]
        }
      };
    
    case ActionTypes.COMPLETE_FACT:
      return {
        ...state,
        progress: {
          ...state.progress,
          completedFacts: [...state.progress.completedFacts, action.payload]
        }
      };
    
    case ActionTypes.COMPLETE_LESSON:
      return {
        ...state,
        progress: {
          ...state.progress,
          completedLessons: [...state.progress.completedLessons, action.payload]
        }
      };
    
    case ActionTypes.UPDATE_STREAK:
      return {
        ...state,
        progress: {
          ...state.progress,
          streak: action.payload
        }
      };
    
    case ActionTypes.SET_DAILY_FACT:
      return {
        ...state,
        dailyFact: action.payload
      };
    
    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload
        }
      };
    
    case ActionTypes.UPDATE_PORTFOLIO:
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          ...action.payload
        }
      };
    
    default:
      return state;
  }
}

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data from localStorage and sync with backend
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, load from localStorage for immediate UI
        let savedData = localStorage.getItem('investnYou-user');
        let parsedData = null;
        
        if (savedData) {
          try {
            parsedData = JSON.parse(savedData);
            
            // Restore user data immediately for UI
            if (parsedData.user) {
              dispatch({ type: ActionTypes.SET_USER, payload: parsedData.user });
            }
            if (parsedData.isOnboarded !== undefined) {
              dispatch({ type: ActionTypes.SET_ONBOARDED, payload: parsedData.isOnboarded });
            }
            if (parsedData.preferences) {
              dispatch({ type: ActionTypes.UPDATE_PREFERENCES, payload: parsedData.preferences });
            }
            if (parsedData.progress) {
              dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: parsedData.progress });
            }
            if (parsedData.portfolio) {
              dispatch({ type: ActionTypes.UPDATE_PORTFOLIO, payload: parsedData.portfolio });
            }
          } catch (parseError) {
            savedData = null;
          }
        }
        
        // If main data failed, try backup
        if (!savedData) {
          const backupData = localStorage.getItem('investnYou-user-backup');
          if (backupData) {
            try {
              parsedData = JSON.parse(backupData);
              
              // Restore from backup
              if (parsedData.user) {
                dispatch({ type: ActionTypes.SET_USER, payload: parsedData.user });
              }
              if (parsedData.progress) {
                dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: parsedData.progress });
              }
            } catch (backupParseError) {
            }
          }
        }
        
        // Now sync with backend to get latest data
        const token = localStorage.getItem('moneysmart-token');
        if (token && parsedData?.user?.id) {
          try {
            
            // Import services dynamically to avoid circular imports
            const { default: ProgressService } = await import('../services/ProgressService');
            
            // Get latest progress from backend
            const progressResponse = await ProgressService.getProgress();
            if (progressResponse.progress) {
              dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: progressResponse.progress });
            }
          } catch (error) {
            // Continue with localStorage data if backend sync fails
          }
        }
      } catch (error) {
      }
    };
    
    loadUserData();
  }, []);

  // Save user data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        ...state,
        // Add timestamp for debugging
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('investnYou-user', JSON.stringify(dataToSave));
      
      // Also save a backup copy
      localStorage.setItem('investnYou-user-backup', JSON.stringify(dataToSave));
      
    } catch (error) {
      // Try to save to backup if main save fails
      try {
        localStorage.setItem('investnYou-user-backup', JSON.stringify(state));
      } catch (backupError) {
      }
    }
  }, [state]);

  // Action creators - memoized to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    setOnboarded: (onboarded) => dispatch({ type: ActionTypes.SET_ONBOARDED, payload: onboarded }),
    updatePreferences: (preferences) => dispatch({ type: ActionTypes.UPDATE_PREFERENCES, payload: preferences }),
    addXp: (amount) => {
      dispatch({ type: ActionTypes.ADD_XP, payload: amount });
    },
    addBadge: (badge) => dispatch({ type: ActionTypes.ADD_BADGE, payload: badge }),
    completeFact: (factId) => dispatch({ type: ActionTypes.COMPLETE_FACT, payload: factId }),
    completeLesson: (lessonId) => dispatch({ type: ActionTypes.COMPLETE_LESSON, payload: lessonId }),
    updateStreak: (streak) => dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streak }),
    setDailyFact: (fact) => dispatch({ type: ActionTypes.SET_DAILY_FACT, payload: fact }),
    updatePortfolio: (portfolio) => dispatch({ type: ActionTypes.UPDATE_PORTFOLIO, payload: portfolio }),
    // Sync with backend to get latest data
    syncWithBackend: async () => {
      try {
        const token = localStorage.getItem('moneysmart-token');
        
        if (!token) {
          return false;
        }
        
        const { default: ProgressService } = await import('../services/ProgressService');
        
        const progressResponse = await ProgressService.getProgress();
        if (progressResponse.progress) {
          dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: progressResponse.progress });
          return true;
        }
        return false;
      } catch (error) {
        // Error details logged
        return false;
      }
    },
    // Emergency XP recovery function
    recoverXp: () => {
      try {
        const backupData = localStorage.getItem('investnYou-user-backup');
        if (backupData) {
          const parsed = JSON.parse(backupData);
          if (parsed.progress && parsed.progress.xp > state.progress.xp) {
            dispatch({ type: ActionTypes.UPDATE_PROGRESS, payload: parsed.progress });
            return true;
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    }
  }), [state.progress.xp]);

  return (
    <UserContext.Provider value={{ state, actions }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
