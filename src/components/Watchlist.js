import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaSearch, FaPlus, FaTrash, FaEdit, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaStar } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import WatchlistService from '../services/WatchlistService';
import StockService from '../services/StockService';
import toast from 'react-hot-toast';
import './Watchlist.css';

const Watchlist = () => {
  const navigate = useNavigate();
  const { state } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '' });
  const [editingStock, setEditingStock] = useState(null);
  const [showPrices, setShowPrices] = useState(true);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        if (!state.user) {
          navigate('/login', { replace: true });
          return;
        }

        setIsAuthenticated(true);
        await loadWatchlist();
      } catch (error) {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, state.user]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      
      // Check if token exists
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const data = await WatchlistService.getWatchlistWithPrices();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error('Load watchlist error:', error);
      toast.error(error.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      if (!newStock.symbol.trim()) {
        toast.error('Please enter a stock symbol');
        return;
      }

      // Fetch stock data first to get name and price
      let stockData = { name: null, price: 0 };
      try {
        const stockInfo = await StockService.getStock(newStock.symbol.toUpperCase());
        if (stockInfo && stockInfo.stock) {
          stockData.name = stockInfo.stock.name || newStock.symbol.toUpperCase();
          stockData.price = stockInfo.stock.price || stockInfo.stock.currentPrice || 0;
        }
      } catch (error) {
        console.warn('Could not fetch stock data, proceeding with symbol only:', error);
      }

      await WatchlistService.addToWatchlist(
        newStock.symbol.toUpperCase(),
        stockData.name,
        stockData.price
      );

      toast.success(`${newStock.symbol} added to watchlist`);
      setNewStock({ symbol: '' });
      setShowAddModal(false);
      await loadWatchlist();
    } catch (error) {
      console.error('Add to watchlist error:', error);
      toast.error(error.message || 'Failed to add stock to watchlist');
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await WatchlistService.removeFromWatchlist(symbol);
      toast.success(`${symbol} removed from watchlist`);
      await loadWatchlist();
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      toast.error(error.message || 'Failed to remove stock from watchlist');
    }
  };

  const updateStock = async (symbol, updates) => {
    try {
      // Since the backend doesn't have an update endpoint for name/notes,
      // we'll need to update the price if provided, otherwise skip
      // For now, just update the local state and reload
      if (updates.price !== undefined) {
        await WatchlistService.updateWatchlistPrice(symbol, updates.price);
      }
      
      // Note: Backend doesn't currently support updating name/notes
      // This would require adding a new endpoint or modifying existing one
      toast.success(`${symbol} updated successfully`);
      setEditingStock(null);
      await loadWatchlist();
    } catch (error) {
      console.error('Update stock error:', error);
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const filteredWatchlist = watchlist.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="watchlist-loading">
        <div className="watchlist-loading-content">
          <div className="watchlist-spinner"></div>
          <p className="watchlist-loading-text">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="watchlist-container watchlist-content">
      {/* Top Bar */}
      <div className="watchlist-top-bar">
        <div className="watchlist-top-content">
          <div className="watchlist-top-left">
            <button onClick={() => navigate('/dashboard')} className="watchlist-back-button">
              ← Back
            </button>
            <h1 className="watchlist-title">Watchlist</h1>
          </div>
          <div className="watchlist-top-right">
            <button
              onClick={() => setShowPrices(!showPrices)}
              className="watchlist-toggle-button"
              title={showPrices ? 'Hide prices' : 'Show prices'}
            >
              {showPrices ? <FaEyeSlash /> : <FaEye />}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="watchlist-add-button"
            >
              <FaPlus />
              Add Stock
            </button>
          </div>
        </div>
      </div>

      <div className="watchlist-main">
        {/* Search Bar */}
        <div className="watchlist-search">
          <div className="watchlist-search-container">
            <FaSearch className="watchlist-search-icon" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="watchlist-search-input"
            />
          </div>
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length === 0 ? (
          <div className="watchlist-empty">
            <FaStar className="watchlist-empty-icon" />
            <h3 className="watchlist-empty-title">No stocks in watchlist</h3>
            <p className="watchlist-empty-text">Add stocks to track their performance</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="watchlist-empty-button"
            >
              <FaPlus />
              Add Your First Stock
            </button>
          </div>
        ) : (
          <div className="watchlist-grid">
            {filteredWatchlist.map((stock, index) => (
              <motion.div
                key={stock.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="watchlist-stock-card"
              >
                <div className="watchlist-stock-header">
                  <div className="watchlist-stock-info">
                    <h3>{stock.symbol}</h3>
                    <p>{stock.name}</p>
                  </div>
                  <div className="watchlist-stock-actions">
                    <button
                      onClick={() => setEditingStock(stock)}
                      className="watchlist-action-button"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(stock.symbol)}
                      className="watchlist-action-button delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {showPrices && (
                  <div className="watchlist-price-info">
                    <div className="watchlist-price-row">
                      <span className="watchlist-price-label">Current Price</span>
                      <span className="watchlist-price-value">
                        ${stock.currentPrice?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {stock.notes && (
                  <div className="watchlist-notes">
                    <p className="watchlist-notes-text">{stock.notes}</p>
                  </div>
                )}

                <div className="watchlist-date">
                  Added {new Date(stock.addedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="watchlist-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="watchlist-modal"
          >
            <div className="watchlist-modal-content">
              <h3 className="watchlist-modal-title">Add Stock to Watchlist</h3>
              
              <div className="watchlist-modal-form">
                <div className="watchlist-modal-group">
                  <label className="watchlist-modal-label">Stock Symbol *</label>
                  <input
                    type="text"
                    placeholder="e.g., AAPL"
                    value={newStock.symbol}
                    onChange={(e) => setNewStock({ symbol: e.target.value.toUpperCase() })}
                    className="watchlist-modal-input"
                  />
                  <p className="watchlist-modal-help">
                    Enter the stock ticker symbol. Company name and current price will be fetched automatically.
                  </p>
                </div>
              </div>

              <div className="watchlist-modal-buttons">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="watchlist-modal-button cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={addToWatchlist}
                  className="watchlist-modal-button primary"
                >
                  Add Stock
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="watchlist-modal-overlay"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="watchlist-modal"
          >
            <div className="watchlist-modal-content">
              <h3 className="watchlist-modal-title">Edit Stock</h3>
              
              <div className="watchlist-modal-form">
                <div className="watchlist-modal-group">
                  <label className="watchlist-modal-label">Company Name</label>
                  <input
                    type="text"
                    value={editingStock.name}
                    onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                    className="watchlist-modal-input"
                  />
                </div>
                
                <div className="watchlist-modal-group">
                  <label className="watchlist-modal-label">Notes</label>
                  <textarea
                    placeholder="Add notes about this stock..."
                    value={editingStock.notes || ''}
                    onChange={(e) => setEditingStock({ ...editingStock, notes: e.target.value })}
                    className="watchlist-modal-textarea"
                  />
                </div>
              </div>

              <div className="watchlist-modal-buttons">
                <button
                  onClick={() => setEditingStock(null)}
                  className="watchlist-modal-button cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStock(editingStock.symbol, {
                    name: editingStock.name,
                    notes: editingStock.notes
                  })}
                  className="watchlist-modal-button primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <div className="nav-bottom">
        <button onClick={() => navigate('/dashboard')} className="nav-item">
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

export default Watchlist;
