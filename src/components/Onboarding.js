import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import AuthService from '../services/AuthService';
import { FaArrowRight, FaArrowLeft, FaUser, FaBullseye, FaLightbulb, FaBook, FaHandPaper, FaClock, FaQuestionCircle } from 'react-icons/fa';

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actions } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    financialGoal: '',
    learningMode: 'facts'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle skip parameter - create guest user immediately
  useEffect(() => {
    const skip = searchParams.get('skip');
    if (skip === 'true') {
      handleGuestSkip();
    }
  }, [searchParams]);

  const handleGuestSkip = async () => {
    setIsLoading(true);
    try {
      // Create guest user with minimal data
      const guestData = {
        name: 'Guest User',
        ageRange: '18-24',
        financialGoal: 'investing',
        learningMode: 'facts'
      };

      const response = await AuthService.guestLogin(guestData);
      
      // Set user data in context
      actions.setUser(response.user);
      actions.setOnboarded(true);
      
      // Save to localStorage
      AuthService.saveUserData({
        user: response.user,
        isOnboarded: true,
        preferences: {
          learningMode: 'facts',
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
        portfolio: {
          balance: 10000,
          stocks: [],
          transactions: []
        }
      });

      navigate('/dashboard');
    } catch (error) {
      // Guest login error
      setIsLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Let's get to know you",
      subtitle: "Help us personalize your experience"
    },
    {
      id: 2,
      title: "Choose your learning style",
      subtitle: "How would you like to learn?"
    },
    {
      id: 3,
      title: "You're all set!",
      subtitle: "Let's start your financial journey"
    }
  ];

  const financialGoals = [
    { id: 'college', label: 'Save for college', icon: '🎓' },
    { id: 'investing', label: 'Understand investing', icon: '📈' },
    { id: 'budgeting', label: 'Learn budgeting', icon: '💰' },
    { id: 'retirement', label: 'Plan for retirement', icon: '🏖️' },
    { id: 'emergency', label: 'Build emergency fund', icon: '🚨' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      actions.setUser(formData);
      actions.setOnboarded(true);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.financialGoal;
      case 2:
        return formData.learningMode;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-2xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
        <p className="text-gray-600">This helps us customize your learning experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your name"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
          <select
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="input"
          >
            <option value="">Select your age</option>
            <option value="13-17">13-17</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35+">35+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What's your main financial goal? *</label>
          <div className="grid grid-cols-1 gap-3">
            {financialGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleInputChange('financialGoal', goal.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.financialGoal === goal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="font-medium">{goal.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaBullseye className="text-2xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to learn?</h2>
        <p className="text-gray-600">Choose your preferred learning style</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleInputChange('learningMode', 'facts')}
          className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
            formData.learningMode === 'facts'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaLightbulb className="text-xl text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Daily Facts Only</h3>
              <p className="text-gray-600">Quick, bite-sized financial tips delivered daily</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleInputChange('learningMode', 'courses')}
          className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
            formData.learningMode === 'courses'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaBook className="text-xl text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Full Courses + Facts</h3>
              <p className="text-gray-600">Comprehensive lessons with daily facts</p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaQuestionCircle className="text-2xl text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-600">Here's what you can do in InvestNYou</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
          <FaHandPaper className="text-2xl text-blue-600" />
          <div>
            <h3 className="font-semibold">Swipe daily facts</h3>
            <p className="text-sm text-gray-600">Learn something new every day</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
          <FaClock className="text-2xl text-green-600" />
          <div>
            <h3 className="font-semibold">Learn at your pace</h3>
            <p className="text-sm text-gray-600">Take your time with lessons</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
          <FaQuestionCircle className="text-2xl text-purple-600" />
          <div>
            <h3 className="font-semibold">Ask questions anytime</h3>
            <p className="text-sm text-gray-600">Get instant answers from our AI</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Show loading state for guest skip
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting up your account...</h2>
          <p className="text-gray-600">Creating your guest experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <motion.div
          className="bg-blue-500 h-1"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="max-w-md mx-auto w-full">
          {/* Step Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-600">
              {steps[currentStep - 1].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`btn btn-ghost ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`btn btn-primary ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentStep === 3 ? "Let's Go!" : 'Next'}
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
