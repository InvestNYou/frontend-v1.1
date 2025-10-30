import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSearch, FaHistory, FaQuestionCircle, FaArrowLeft, FaFilter } from 'react-icons/fa';
import AskService from '../services/AskService';
import toast from 'react-hot-toast';

const PromptsHistory = ({ onBack, embedded = false }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alphabetical

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    filterAndSortPrompts();
  }, [prompts, searchTerm, sortBy]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await AskService.getHistory(1, 100); // Get more prompts
      
      if (response.success && response.data.messages) {
        // Extract only user prompts
        const userPrompts = response.data.messages
          .filter(msg => msg.prompt)
          .map(msg => ({
            id: msg.id,
            content: msg.prompt,
            timestamp: new Date(msg.createdAt),
            response: msg.response
          }));
        
        setPrompts(userPrompts);
      }
    } catch (error) {
      // Failed to load prompts
      toast.error('Failed to load prompts history');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPrompts = () => {
    let filtered = prompts;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(prompt => 
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'alphabetical':
          return a.content.localeCompare(b.content);
        default:
          return 0;
      }
    });

    setFilteredPrompts(filtered);
  };

  const handlePromptClick = (prompt) => {
    // If embedded, we need to pass the prompt to the parent
    if (embedded && onBack) {
      // Pass the prompt content back to the parent component
      onBack(prompt.content);
    } else {
      // Original behavior for standalone view
      toast.success('Prompt copied to clipboard!');
      navigator.clipboard.writeText(prompt.content);
    }
  };

  if (loading) {
    return (
      <div className={`${embedded ? 'py-4' : 'min-h-screen bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading your prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      {/* Header - only show if not embedded */}
      {!embedded && (
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                <FaArrowLeft className="text-xl" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FaHistory className="text-blue-500" />
                <span>Your Prompts History</span>
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredPrompts.length} of {prompts.length} prompts
              {prompts.length > 0 && (
                <span className="ml-2 text-blue-600">
                  • {new Set(prompts.map(p => p.timestamp.toDateString())).size} days active
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className={`${embedded ? 'bg-transparent' : 'bg-white border-b border-gray-200'} px-4 py-3`}>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search your prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Prompts List */}
      <div className={embedded ? 'max-h-96 overflow-y-auto' : 'p-4'}>
        <AnimatePresence>
          {filteredPrompts.length > 0 ? (
            <div className="space-y-3">
              {filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 leading-relaxed mb-2">
                        {prompt.content}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{prompt.timestamp.toLocaleString()}</span>
                        <span className="text-blue-500 group-hover:text-blue-700">
                          Click to copy
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No prompts found' : 'No prompts yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No prompts match "${searchTerm}"` 
                  : 'Start asking questions to build your prompts history'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromptsHistory;
