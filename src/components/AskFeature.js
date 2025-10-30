import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaPaperPlane, FaRobot, FaUser, FaExclamationTriangle, FaHistory } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import AskService from '../services/AskService';
import PromptsHistory from './PromptsHistory';
import toast from 'react-hot-toast';
import './AskFeature.css';

const AskFeature = () => {
  const navigate = useNavigate();
  const { state } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [serviceAvailable, setServiceAvailable] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [previousPrompts, setPreviousPrompts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // auth
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        
        // check user auth
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        // exist in content
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

    initializeComponent();
  }, [navigate, state.user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // load data after auth
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && AuthService.isAuthenticated()) {
        // load suggestions (no auth required)
        try {
          const suggestionsResponse = await AskService.getSuggestions();
          if (suggestionsResponse.success && suggestionsResponse.data.suggestions) {
            setSuggestions(suggestionsResponse.data.suggestions);
          }
        } catch (error) {
        }

        // check ai service availability (no auth required)
        try {
          const isAvailable = await AskService.isServiceAvailable();
          setServiceAvailable(isAvailable);
        } catch (error) {
          setServiceAvailable(false);
        }

        // load conversation history (requires auth) - Load more messages for better conversation flow
        setLoadingHistory(true);
        try {
          // Only try to load history if user is authenticated
          if (AuthService.isAuthenticated()) {
            const historyResponse = await AskService.getHistory(1, 50); // Increased from 20 to 50
            
            if (historyResponse.success && historyResponse.data.messages && historyResponse.data.messages.length > 0) {
              const formattedMessages = [];
              const prompts = [];
              
              // Create pairs of user messages and AI responses
              historyResponse.data.messages.forEach(msg => {
                // Add user message (the prompt)
                if (msg.prompt) {
                  formattedMessages.push({
                    id: msg.id + '_user',
                    type: 'user',
                    content: msg.prompt,
                    timestamp: new Date(msg.createdAt)
                  });
                  
                  // Also add to prompts for quick access
                  prompts.push({
                    id: msg.id,
                    content: msg.prompt,
                    timestamp: new Date(msg.createdAt)
                  });
                }
                
                // Add AI response
                if (msg.response) {
                  formattedMessages.push({
                    id: msg.id + '_ai',
                    type: 'ai',
                    content: msg.response,
                    timestamp: new Date(msg.createdAt)
                  });
                }
              });
              
              // Sort by timestamp to maintain chronological order
              formattedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
              prompts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first for prompts
              
              // Only set messages if we have history, otherwise keep test messages
              if (formattedMessages.length > 0) {
                setMessages(formattedMessages);
              }
              setPreviousPrompts(prompts);
            } else {
            }
          } else {
          }
        } catch (error) {
          // Don't show error to user, just start with empty conversation
        } finally {
          setLoadingHistory(false);
        }
      }
    };

    loadData();
  }, [isAuthenticated]);

  const preloadedPrompts = suggestions.length > 0 ? suggestions.slice(0, 6) : [
    "What's a Roth IRA?",
    "How do taxes work?",
    "What's the difference between stocks and bonds?",
    "How do I start investing?",
    "What's compound interest?",
    "How do I build an emergency fund?"
  ];

  const sampleResponses = {
    "What's a Roth IRA?": "A Roth IRA is a retirement account where you pay taxes now, not later. Great for young people expecting higher income in the future! You contribute after-tax money, and withdrawals in retirement are tax-free. Want to know more about IRAs?",
    "How do taxes work?": "Taxes are mandatory payments to the government based on your income. The US uses a progressive tax system - the more you earn, the higher your tax rate. You file annually and can get refunds if you overpaid. Need help understanding tax brackets?",
    "What's the difference between stocks and bonds?": "Stocks represent ownership in a company - you're a partial owner! Bonds are loans you make to companies or governments. Stocks are riskier but potentially more rewarding, while bonds are safer but typically lower returns. Want to learn about diversification?",
    "How do I start investing?": "Start small! Open a brokerage account, begin with index funds (they're diversified and low-cost), and invest regularly. Even $25/month can grow significantly over time. Remember: time in the market beats timing the market!",
    "What's compound interest?": "Compound interest is when you earn interest on both your original investment AND previously earned interest. It's like a snowball effect - the longer you invest, the faster your money grows. Albert Einstein called it the 8th wonder of the world!",
    "How do I build an emergency fund?": "Start with $1,000, then build to 3-6 months of expenses. Keep it in a high-yield savings account (not invested). This safety net prevents you from going into debt during unexpected situations like job loss or medical bills."
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add to previous prompts for quick access
    setPreviousPrompts(prev => [{
      id: userMessage.id,
      content: message,
      timestamp: userMessage.timestamp
    }, ...prev.slice(0, 9)]); // Keep only 10 most recent
    
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('[AskFeature] Sending message:', message);
      
      // Check if AI service is available
      if (!serviceAvailable) {
        console.log('[AskFeature] Service unavailable, checking status...');
        const isAvailable = await AskService.isServiceAvailable();
        setServiceAvailable(isAvailable);
        
        if (!isAvailable) {
          const error = new Error('AI service is currently unavailable. Please check if the backend server is running and try again later.');
          console.error('[AskFeature] Service unavailable:', error);
          throw error;
        }
        console.log('[AskFeature] Service is now available');
      }

      // Send question to backend
      console.log('[AskFeature] Calling AskService.askQuestion...');
      const response = await AskService.askQuestion(message);
      console.log('[AskFeature] Response received:', {
        success: response.success,
        hasData: !!response.data,
        requestId: response.requestId
      });
      
      if (response.success) {
        const aiMessage = {
          id: response.data.id + '_response',
          type: 'ai',
          content: response.data.answer,
          timestamp: new Date(response.data.createdAt)
        };

        setMessages(prev => [...prev, aiMessage]);
        toast.success('Question answered successfully!');
        console.log('[AskFeature] Message added to conversation');
      } else {
        const error = new Error(response.message || response.error || 'Failed to get AI response');
        console.error('[AskFeature] Response was not successful:', error, response);
        throw error;
      }
    } catch (error) {
      console.error('[AskFeature] Error in handleSendMessage:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Determine the type of error and provide appropriate feedback
      let errorMessage = "I apologize, but I'm having trouble processing your request right now.";
      
      if (error.message.includes('Unable to connect to the server')) {
        errorMessage = "Unable to connect to the AI service. Please check if the backend server is running on port 5000.";
      } else if (error.message.includes('AI service is currently unavailable')) {
        errorMessage = "The AI service is currently unavailable. Please try again later or contact support.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "The request timed out. Please try again with a shorter question.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorMessage + " If the problem persists, please check your internet connection and try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      toast.error(error.message || 'Failed to get AI response');
    } finally {
      setIsLoading(false);
      console.log('[AskFeature] handleSendMessage completed');
    }
  };

  const handlePromptClick = (prompt) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  // Regenerate AI response
  const handleRegenerateResponse = async (messageId, originalPrompt) => {
    try {
      setIsLoading(true);
      
      // Remove the current AI response
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Send the original prompt again to get a new response
      await handleSendMessage(originalPrompt);
      
      toast.success('Regenerating response...');
    } catch (error) {
      toast.error('Failed to regenerate response');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking authentication
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

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }


  return (
    <div className="ask-feature-container content-with-nav">
      {/* Top Bar */}
      <div className="ask-feature-top-bar">
        <div className="ask-feature-top-bar-content">
          <div className="ask-feature-top-bar-left">
            <button onClick={() => navigate('/dashboard')} className="ask-feature-back-button">
              ← Back
            </button>
            <h1 className="ask-feature-title">Ask InvestNYou</h1>
          </div>
          <div className="ask-feature-top-bar-right">
            <FaRobot className="ask-feature-ai-icon" />
            <span>AI Assistant</span>
            {!serviceAvailable && (
              <div className="ask-feature-service-unavailable">
                <FaExclamationTriangle className="text-xs" />
                <span className="text-xs">Service Unavailable</span>
              </div>
            )}
            <button 
              onClick={async () => {
                try {
                  const isAvailable = await AskService.isServiceAvailable();
                  setServiceAvailable(isAvailable);
                  
                  if (isAvailable) {
                    toast.success('AI service is available!');
                  } else {
                    toast.error('AI service is not available. Check backend server.');
                  }
                } catch (error) {
                  toast.error('Connection test failed: ' + error.message);
                  console.error('Connection test error:', error);
                }
              }}
              className="ask-feature-test-connection"
            >
              Test Connection
            </button>
            {(process.env.NODE_ENV === 'development' || localStorage.getItem('ask-debug') === 'true') && (
              <button 
                onClick={async () => {
                  try {
                    console.log('🔍 Fetching debug information...');
                    const debugInfo = await AskService.getDebugInfo();
                    console.log('📊 Debug Information:', debugInfo);
                    toast.success('Debug info logged to console. Check browser console.');
                  } catch (error) {
                    console.error('❌ Debug info error:', error);
                    toast.error('Failed to get debug info: ' + error.message);
                  }
                }}
                className="ask-feature-test-connection"
                style={{ marginLeft: '8px' }}
              >
                Debug Info
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="ask-feature-chat-container">
        {/* Chat Messages */}
        <div className="ask-feature-messages-area">
          {loadingHistory && (
            <div className="ask-feature-loading-history">
              <div className="ask-feature-loading-spinner">
                <div className="ask-feature-spinner"></div>
                <span className="text-sm">Loading conversation history...</span>
              </div>
            </div>
          )}
          
          {!serviceAvailable && (
            <div className="ask-feature-service-warning">
              <div className="ask-feature-warning-content">
                <FaExclamationTriangle />
                <span className="font-medium">AI Service Unavailable</span>
              </div>
              <p className="ask-feature-warning-text">
                The AI assistant is currently unavailable. Please try again later or contact support if the issue persists.
              </p>
            </div>
          )}
          
          {messages.length === 0 && !loadingHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ask-feature-welcome"
            >
              <div className="ask-feature-welcome-icon">
                <FaRobot className="text-2xl text-blue-600" />
              </div>
              <h3 className="ask-feature-welcome-title">
                Hi! I'm your financial learning assistant
              </h3>
              <p className="ask-feature-welcome-subtitle">
                Ask me anything about personal finance, investing, budgeting, and more!
              </p>
              
              <div className="ask-feature-prompts-grid">
                {preloadedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="ask-feature-prompt-button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              
              {/* Previous Prompts */}
              {previousPrompts.length > 0 && (
                <div className="ask-feature-previous-prompts">
                  <h4 className="ask-feature-previous-title">
                    <FaHistory className="ask-feature-previous-icon" />
                    <span>Your Previous Questions</span>
                  </h4>
                  <div className="ask-feature-previous-grid">
                    {previousPrompts.slice(0, 5).map((prompt, index) => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.content)}
                        className="ask-feature-previous-button"
                      >
                        <div className="ask-feature-previous-content">{prompt.content}</div>
                        <div className="ask-feature-previous-timestamp">
                          {prompt.timestamp.toLocaleDateString()} at {prompt.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}



          <AnimatePresence>
            {messages.map((message, index) => {
              const isUser = message.type === 'user';
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.type !== message.type;
              const showTime = index === messages.length - 1 || 
                              (index < messages.length - 1 && 
                               messages[index + 1].type !== message.type);



              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`ask-feature-message-container ${isUser ? 'user' : 'ai'}`}
                >
                  {isUser ? (
                    // User message layout - RIGHT SIDE
                    <div className="ask-feature-message-wrapper">
                      {/* Message Content */}
                      <div className="ask-feature-message-content">
                        {/* Message Bubble */}
                        <div className="ask-feature-message-bubble user">
                          <div className="ask-feature-message-text">
                            {message.content}
                          </div>
                          
                          {/* Message Tail */}
                          <div className="ask-feature-message-tail user"></div>
                        </div>
                        
                        {/* Timestamp */}
                        {showTime && (
                          <div className="ask-feature-message-timestamp">
                            <div className="ask-feature-timestamp-text">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Avatar */}
                      {showAvatar && (
                        <div className="ask-feature-avatar user">
                          <FaUser />
                        </div>
                      )}
                    </div>
                  ) : (
                    // AI message layout - LEFT SIDE
                    <div className="ask-feature-message-wrapper ai">
                      {/* Avatar */}
                      {showAvatar && (
                        <div className="ask-feature-avatar ai">
                          <FaRobot />
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className="ask-feature-message-content ai">
                        {/* Message Bubble */}
                        <div className="ask-feature-message-bubble ai">
                          <div className="ask-feature-message-text ai">
                            {message.content}
                          </div>
                          
                          {/* Message Tail */}
                          <div className="ask-feature-message-tail ai"></div>
                        </div>
                        
                        {/* Timestamp and Actions */}
                        {showTime && (
                          <div className="ask-feature-message-timestamp ai">
                            <div className="ask-feature-timestamp-text ai">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                            
                            {/* Action buttons for AI messages */}
                            <div className="ask-feature-message-actions">
                              <button 
                                className="ask-feature-action-button" 
                                title="Copy to clipboard"
                                onClick={() => handleCopyMessage(message.content)}
                              >
                                📋
                              </button>
                              <button 
                                className="ask-feature-action-button" 
                                title="Regenerate response"
                                onClick={() => {
                                  // Find the original user prompt for this AI response
                                  const messageIndex = messages.findIndex(msg => msg.id === message.id);
                                  if (messageIndex > 0) {
                                    const userMessage = messages[messageIndex - 1];
                                    if (userMessage.type === 'user') {
                                      handleRegenerateResponse(message.id, userMessage.content);
                                    }
                                  }
                                }}
                              >
                                🔄
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ask-feature-typing-container"
            >
              <div className="ask-feature-typing-wrapper">
                {/* AI Avatar */}
                <div className="ask-feature-avatar ai">
                  <FaRobot />
                </div>
                
                {/* Typing Indicator */}
                <div className="ask-feature-typing-bubble">
                  <div className="ask-feature-typing-content">
                    <div className="ask-feature-typing-text">
                      <span className="text-sm text-gray-600">AI is typing</span>
                      <div className="ask-feature-typing-dots">
                        <div className="ask-feature-typing-dot"></div>
                        <div className="ask-feature-typing-dot"></div>
                        <div className="ask-feature-typing-dot"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Tail */}
                  <div className="ask-feature-typing-tail"></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
          
          {/* Previous Prompts - Show when there are messages */}
          {messages.length > 0 && previousPrompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ask-feature-previous-section"
            >
              <h4 className="ask-feature-previous-section-title">
                <FaHistory className="ask-feature-previous-section-icon" />
                <span>Previous Questions</span>
              </h4>
              <div className="ask-feature-previous-section-buttons">
                {previousPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt.content)}
                    className="ask-feature-previous-section-button"
                  >
                    {prompt.content.length > 50 ? prompt.content.substring(0, 50) + '...' : prompt.content}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="ask-feature-input-container">
          <div className="ask-feature-input-wrapper">
            <div className="ask-feature-input-field">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={serviceAvailable ? "Type your question here..." : "AI service is currently unavailable"}
                disabled={!serviceAvailable}
                className={`ask-feature-textarea ${
                  !serviceAvailable ? 'disabled' : ''
                }`}
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading || !serviceAvailable}
                className={`ask-feature-send-button ${
                  !inputValue.trim() || isLoading || !serviceAvailable ? 'disabled' : ''
                }`}
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
          
          <div className="ask-feature-input-footer">
            <div className="ask-feature-input-footer-left">
              <span>💡 Educational information only</span>
              {serviceAvailable && (
                <div className="ask-feature-status-indicator">
                  <div className="ask-feature-status-dot"></div>
                  <span>AI Online</span>
                </div>
              )}
            </div>
            <div className="text-gray-400">
              Press Enter to send
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="nav-bottom">
        <button onClick={() => navigate('/dashboard')} className="nav-item">
          <FaHome className="text-xl mb-1" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/learn')} className="nav-item">
          <FaGraduationCap className="text-xl mb-1" />
          <span>Learn</span>
        </button>
        <button className="nav-item active">
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

export default AskFeature;
