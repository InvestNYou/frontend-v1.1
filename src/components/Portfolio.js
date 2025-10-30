import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { FaHome, FaGraduationCap, FaQuestionCircle, FaChartLine, FaSearch, FaArrowUp, FaArrowDown, FaLock, FaChartArea, FaStar } from 'react-icons/fa';
import AuthService from '../services/AuthService';
import PortfolioService from '../services/PortfolioService';
import StockService from '../services/StockService';
import toast from 'react-hot-toast';
import PortfolioTimeGraph from './PortfolioTimeGraph';
import './Toggle.css';
import './Portfolio.css';

const Portfolio = () => {
  const navigate = useNavigate();
  const { state, actions } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [stockToSell, setStockToSell] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTimeGraph, setShowTimeGraph] = useState(false);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gainLossView, setGainLossView] = useState('alltime'); // 'alltime' or 'daily'

  // Helper function to safely parse numbers
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Authentication check and portfolio data loading
  useEffect(() => {
    const checkAuth = async () => {
      try {
        
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        // Check if user exists in context
        if (!state.user) {
          
          navigate('/login', { replace: true });
          return;
        }

        setIsAuthenticated(true);

        // Load portfolio data from backend
        await loadPortfolioData();
      } catch (error) {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, state.user]);

  // Load available stocks from Alpha Vantage
  const loadAvailableStocks = async () => {
    try {
      setStocksLoading(true);
      
      const data = await StockService.getStocks();
      
      if (data.stocks && data.stocks.length > 0) {
        // Ensure proper data formatting
        const formattedStocks = data.stocks.map(stock => ({
          symbol: stock.symbol || 'N/A',
          name: stock.name || stock.symbol || 'Unknown',
          price: parseFloat(stock.price) || 0,
          change: parseFloat(stock.change) || 0,
          changePercent: parseFloat(stock.changePercent) || 0
        }));
        setAvailableStocks(formattedStocks);
      } else {
        // No stocks available
        setAvailableStocks([]);
      }
    } catch (error) {
      // No fallback stocks available
      setAvailableStocks([]);
      toast.error('Failed to load stock data. Please try again.');
    } finally {
      setStocksLoading(false);
    }
  };

  // Load stocks when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadAvailableStocks();
    }
  }, [isAuthenticated]);

  // Refresh portfolio data
  const refreshPortfolioData = async () => {
    try {
      setRefreshing(true);
      
      // Refresh both portfolio holdings and available stocks
      await Promise.all([
        loadPortfolioData(),
        loadAvailableStocks()
      ]);
      
      toast.success('Portfolio data refreshed with real-time prices!');
    } catch (error) {
      toast.error('Failed to refresh portfolio data');
    } finally {
      setRefreshing(false);
    }
  };

  // Search stocks using Alpha Vantage
  const searchStocks = async (query) => {
    if (!query.trim()) {
      loadAvailableStocks(); // Load popular stocks if no search query
      return;
    }

    try {
      setStocksLoading(true);
      
      const data = await StockService.searchStocks(query);
      
      if (data.stocks && data.stocks.length > 0) {
        // Convert Alpha Vantage format to our format with proper validation
        const formattedStocks = data.stocks.map(stock => ({
          symbol: stock.symbol || 'N/A',
          name: stock.name || stock.symbol || 'Unknown',
          price: parseFloat(stock.price) || 0,
          change: parseFloat(stock.change) || 0,
          changePercent: parseFloat(stock.changePercent) || 0
        }));
        setAvailableStocks(formattedStocks);
      } else {
        setAvailableStocks([]);
        toast(`No stocks found for "${query}"`);
      }
    } catch (error) {
      toast.error('Search failed. Using available stocks.');
    } finally {
      setStocksLoading(false);
    }
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchStocks(searchTerm);
      } else {
        loadAvailableStocks();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load portfolio data from backend with real-time prices
  const loadPortfolioData = async () => {
    try {
      
      const data = await PortfolioService.getHoldings();

      // Update local state with backend data
      if (data.portfolio) {
        actions.updatePortfolio({
          balance: parseFloat(data.portfolio.balance),
          totalValue: parseFloat(data.portfolio.totalValue),
          totalInvested: parseFloat(data.portfolio.totalInvested),
          totalCurrentValue: parseFloat(data.portfolio.totalCurrentValue),
          totalAllTimeGainLoss: parseFloat(data.portfolio.totalAllTimeGainLoss),
          totalAllTimeGainLossPercent: parseFloat(data.portfolio.totalAllTimeGainLossPercent),
          totalDailyGainLoss: parseFloat(data.portfolio.totalDailyGainLoss),
          totalDailyGainLossPercent: parseFloat(data.portfolio.totalDailyGainLossPercent)
        });
      }

      // Convert holdings to stock format for compatibility
      if (data.holdings && data.holdings.length > 0) {
        
        const stocks = data.holdings.map(holding => ({
          symbol: holding.symbol,
          name: holding.name,
          shares: holding.shares,
          buyPrice: holding.averageCost,
          currentPrice: holding.currentPrice,
          currentValue: holding.currentValue,
          allTimeGainLoss: holding.allTimeGainLoss,
          allTimeGainLossPercent: holding.allTimeGainLossPercent,
          dailyGainLoss: holding.dailyGainLoss,
          dailyGainLossPercent: holding.dailyGainLossPercent,
          dailyChange: holding.dailyChange,
          dailyChangePercent: holding.dailyChangePercent
        }));


        actions.updatePortfolio({
          stocks
        });

        
        // Force a re-render check
        setTimeout(() => {
        }, 100);

        // Fetch real-time prices for portfolio stocks using scraped data
        await fetchRealTimePricesForPortfolio(data.holdings || [], stocks);
      } else {
      }

    } catch (error) {
      
      // Check if it's a network error (backend not running)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else if (error.message.includes('<!DOCTYPE')) {
        toast.error('Server returned HTML instead of JSON. Check if backend is running correctly.');
      } else {
        toast.error(`Failed to load portfolio data: ${error.message}`);
      }
    }
  };

  // Fetch real-time prices for portfolio stocks using scraped data
  const fetchRealTimePricesForPortfolio = async (holdings, currentStocks) => {
    try {
      
      // Get unique symbols from holdings
      const symbols = [...new Set(holdings.map(holding => holding.symbol))];
      
      // Fetch real-time data for each symbol using the scraped data endpoint
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const data = await StockService.getStockPrice(symbol);
          return { symbol, data };
        } catch (error) {
          return { symbol, data: null };
        }
      });

      const priceResults = await Promise.all(pricePromises);
      
      // Update portfolio stocks with real-time prices using the passed stocks instead of state
      const updatedStocks = currentStocks.map(stock => {
        const priceData = priceResults.find(result => result.symbol === stock.symbol);
        if (priceData && priceData.data) {
          const newPrice = parseFloat(priceData.data.price);
          return {
            ...stock,
            currentPrice: newPrice,
            name: priceData.data.name || stock.name
          };
        }
        return stock;
      });


      // Update the portfolio state with real-time prices
      actions.updatePortfolio({
        stocks: updatedStocks
      });

      
    } catch (error) {
    }
  };

  // Check if portfolio is unlocked (requires 2 completed courses)
  const isPortfolioUnlocked = state.progress.completedLessons.length >= 2;

  // Sample stock data

  const filteredStocks = availableStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuyStock = async () => {
    if (!selectedStock || quantity <= 0) return;

    // Validate stock data
    const stockPrice = parseFloat(selectedStock.price) || 0;
    if (stockPrice <= 0) {
      toast.error('Invalid stock price. Please try again.');
      return;
    }

    const totalCost = stockPrice * quantity;
    if (totalCost > state.portfolio.balance) {
      toast.error('Insufficient balance!');
      return;
    }

    try {
      
      // Make API call to backend to save the transaction
      const result = await PortfolioService.buyStock(selectedStock.symbol, quantity, stockPrice);

      // Update local state with the response from backend
      actions.updatePortfolio({
        balance: parseFloat(result.portfolio.balance),
        totalValue: parseFloat(result.portfolio.totalValue)
      });

      // Add transaction to local state for immediate UI update
      const newTransaction = {
        id: result.transaction.id,
        type: 'buy',
        symbol: selectedStock.symbol,
        shares: quantity,
        price: selectedStock.price,
        total: totalCost,
        timestamp: new Date(result.transaction.createdAt)
      };

      // Update local portfolio state
      const updatedStocks = [...state.portfolio.stocks];
      const existingStockIndex = updatedStocks.findIndex(stock => stock.symbol === selectedStock.symbol);
      
      if (existingStockIndex >= 0) {
        // Update existing stock
        updatedStocks[existingStockIndex].shares += quantity;
      } else {
        // Add new stock
        updatedStocks.push({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          shares: quantity,
          buyPrice: selectedStock.price,
          currentPrice: selectedStock.price
        });
      }

      actions.updatePortfolio({
        stocks: updatedStocks,
        transactions: [...state.portfolio.transactions, newTransaction]
      });

      toast.success(`✅ Bought ${quantity} shares of ${selectedStock.symbol} for $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setShowBuyModal(false);
      setSelectedStock(null);
      setQuantity(1);

    } catch (error) {
      toast.error(`Failed to buy stock: ${error.message}`);
    }
  };

  const handleSellStock = async () => {
    if (!stockToSell || sellQuantity <= 0) return;

    // Use scraped currentPrice first, then fallback to buyPrice
    const currentPrice = stockToSell.currentPrice || stockToSell.buyPrice;
    const totalValue = currentPrice * sellQuantity;

    try {
      
      // Debug the data being sent
      const transactionData = {
        symbol: stockToSell.symbol,
        shares: sellQuantity,
        price: currentPrice,
        type: 'sell'
      };
      
      
      // Make API call to backend to save the transaction
      const result = await PortfolioService.sellStock(stockToSell.symbol, sellQuantity, currentPrice);

      // Update local state with the response from backend
      actions.updatePortfolio({
        balance: parseFloat(result.portfolio.balance),
        totalValue: parseFloat(result.portfolio.totalValue)
      });

      // Add transaction to local state for immediate UI update
      const newTransaction = {
        id: result.transaction.id,
        type: 'sell',
        symbol: stockToSell.symbol,
        shares: sellQuantity,
        price: currentPrice,
        total: totalValue,
        timestamp: new Date(result.transaction.createdAt)
      };

      // Update local portfolio state
      const updatedStocks = [...state.portfolio.stocks];
      const stockIndex = updatedStocks.findIndex(stock => stock.symbol === stockToSell.symbol);
      
      if (stockIndex >= 0) {
        updatedStocks[stockIndex].shares -= sellQuantity;
        if (updatedStocks[stockIndex].shares <= 0) {
          updatedStocks.splice(stockIndex, 1);
        }
      }

      actions.updatePortfolio({
        stocks: updatedStocks,
        transactions: [...state.portfolio.transactions, newTransaction]
      });

      toast.success(`✅ Sold ${sellQuantity} shares of ${stockToSell.symbol} for $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setShowSellModal(false);
      setStockToSell(null);
      setSellQuantity(1);

    } catch (error) {
      toast.error(`Failed to sell stock: ${error.message}`);
    }
  };

  const calculatePortfolioValue = () => {
    const stockValue = state.portfolio.stocks.reduce((total, stock) => {
      // Use scraped currentPrice first, then fallback to buyPrice or averagePrice
      const currentPrice = stock.currentPrice || stock.buyPrice || stock.averagePrice || 0;
      const shares = stock.shares || stock.quantity || 0;
      return total + (currentPrice * shares);
    }, 0);
    return (state.portfolio.balance || 0) + stockValue;
  };

  const calculateTotalGainLoss = () => {
    const totalInvested = state.portfolio.stocks.reduce((total, stock) => {
      const buyPrice = stock.buyPrice || stock.averagePrice || 0;
      const shares = stock.shares || stock.quantity || 0;
      return total + (buyPrice * shares);
    }, 0);
    const currentValue = state.portfolio.stocks.reduce((total, stock) => {
      // Use scraped currentPrice first, then fallback to buyPrice or averagePrice
      const currentPrice = stock.currentPrice || stock.buyPrice || stock.averagePrice || 0;
      const shares = stock.shares || stock.quantity || 0;
      return total + (currentPrice * shares);
    }, 0);
    return currentValue - totalInvested;
  };

  const calculateTotalGainLossPercent = () => {
    const totalInvested = state.portfolio.stocks.reduce((total, stock) => {
      const buyPrice = stock.buyPrice || stock.averagePrice || 0;
      const shares = stock.shares || stock.quantity || 0;
      return total + (buyPrice * shares);
    }, 0);
    if (totalInvested === 0) return 0;
    const gainLoss = calculateTotalGainLoss();
    return (gainLoss / totalInvested) * 100;
  };

  if (!isPortfolioUnlocked) {
    return (
      <div className="portfolio-locked-container">
        {/* Top Bar */}
        <div className="portfolio-top-bar">
          <div className="portfolio-top-bar-content">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/dashboard')} className="portfolio-back-button">
                ← Back
              </button>
              <h1 className="portfolio-title">Portfolio</h1>
            </div>
          </div>
        </div>

        <div className="portfolio-locked-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="portfolio-locked-card"
          >
            <div className="portfolio-locked-icon">
              <FaLock />
            </div>
            <h2 className="portfolio-locked-title">
              Portfolio Locked
            </h2>
            <p className="portfolio-locked-description">
              Complete 2 learning modules to unlock the portfolio simulator and start practicing with virtual trading.
            </p>
            <div className="portfolio-locked-progress">
              <p className="portfolio-locked-progress-text">
                <strong>Progress:</strong> {state.progress.completedLessons.length}/2 modules completed
              </p>
            </div>
            <button
              onClick={() => navigate('/learn')}
              className="portfolio-locked-button"
            >
              Start Learning
            </button>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <div className="portfolio-bottom-nav">
          <button onClick={() => navigate('/dashboard')} className="portfolio-nav-item">
            <FaHome className="portfolio-nav-icon" />
            <span>Home</span>
          </button>
          <button onClick={() => navigate('/learn')} className="portfolio-nav-item">
            <FaGraduationCap className="portfolio-nav-icon" />
            <span>Learn</span>
          </button>
          <button onClick={() => navigate('/ask')} className="portfolio-nav-item">
            <FaQuestionCircle className="portfolio-nav-icon" />
            <span>Ask</span>
          </button>
          <button className="portfolio-nav-item active">
            <FaChartLine className="portfolio-nav-icon" />
            <span>Portfolio</span>
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-loading-container">
          <div className="portfolio-loading-spinner"></div>
          <span className="portfolio-loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="portfolio-container">
      {/* Top Bar */}
      <div className="portfolio-top-bar">
        <div className="portfolio-top-bar-content">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/dashboard')} className="portfolio-back-button">
              ← Back
            </button>
            <h1 className="portfolio-title">Portfolio</h1>
          </div>
        </div>
      </div>

      <div className="portfolio-main-content">
        <div className="portfolio-content-grid">
          {/* Portfolio Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="portfolio-summary-card"
          >
            <div className="portfolio-summary-header">
              <h2 className="portfolio-summary-title">Portfolio Summary</h2>
              <div className="portfolio-action-buttons">
                <button
                  onClick={refreshPortfolioData}
                  disabled={refreshing}
                  className="portfolio-refresh-button"
                >
                  <div className="portfolio-refresh-icon">
                    {refreshing ? (
                      <div className="portfolio-refresh-spinner"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button
                  onClick={() => navigate('/watchlist')}
                  className="portfolio-watchlist-button"
                >
                  <FaStar className="text-sm" />
                  <span>Watchlist</span>
                </button>
                <button
                  onClick={() => setShowTimeGraph(true)}
                  className="portfolio-graph-button"
                >
                  <FaChartArea className="text-sm" />
                  <span>View Graph</span>
                </button>
              </div>
            </div>
            <div className="portfolio-stats-grid">
              <div className="portfolio-stat-item">
                <p className="portfolio-stat-label">Cash Balance</p>
                <p className="portfolio-stat-value">${(state.portfolio.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="portfolio-stat-item">
                <p className="portfolio-stat-label">Total Value</p>
                <p className="portfolio-stat-value">${calculatePortfolioValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="portfolio-gainloss-section">
              <div className="portfolio-gainloss-content">
                <span className="portfolio-gainloss-label">Gain/Loss</span>
                <div className="portfolio-gainloss-values">
                  <span className={`portfolio-gainloss-amount ${
                    calculateTotalGainLoss() >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                  }`}>
                    {calculateTotalGainLoss() >= 0 ? '+' : ''}${calculateTotalGainLoss().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`portfolio-gainloss-percent ${
                    calculateTotalGainLossPercent() >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                  }`}>
                    ({calculateTotalGainLossPercent() >= 0 ? '+' : ''}{calculateTotalGainLossPercent().toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="portfolio-search-container"
          >
            <FaSearch className="portfolio-search-icon" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="portfolio-search-input"
            />
          </motion.div>

          {/* Stock List */}
          <div className="portfolio-stock-list">
            {stocksLoading ? (
              <div className="portfolio-loading-container">
                <div className="portfolio-loading-spinner"></div>
                <span className="portfolio-loading-text">Loading stocks...</span>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="portfolio-empty-state">
                <p>No stocks found</p>
                <p className="portfolio-empty-description">Try searching for a different stock symbol</p>
              </div>
            ) : (
              filteredStocks.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="portfolio-stock-item"
                >
                  <div className="portfolio-stock-content">
                    <div className="portfolio-stock-info">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="portfolio-stock-symbol">{stock.symbol}</h3>
                          <p className="portfolio-stock-name">{stock.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-stock-price">
                      <p>${(parseFloat(stock.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStock(stock);
                        setShowBuyModal(true);
                      }}
                      className="portfolio-buy-button"
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* My Stocks */}
          {state.portfolio.stocks && state.portfolio.stocks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="portfolio-mystocks-card"
            >
              <div className="portfolio-mystocks-header">
                <h3 className="portfolio-mystocks-title">My Stocks</h3>
                {/* Light Gray Toggle */}
                <div className="portfolio-toggle-container">
                  <div className="portfolio-toggle-wrapper">
                    {/* Sliding Background Indicator */}
                    <div 
                      className={`portfolio-toggle-slider ${
                        gainLossView === 'alltime' ? 'all-time' : 'daily'
                      }`}
                    />
                    
                    {/* Toggle Buttons */}
                    <button
                      onClick={() => setGainLossView('alltime')}
                      className={`portfolio-toggle-button ${
                        gainLossView === 'alltime' ? 'active' : 'inactive'
                      }`}
                    >
                      All-Time
                    </button>
                    <button
                      onClick={() => setGainLossView('daily')}
                      className={`portfolio-toggle-button ${
                        gainLossView === 'daily' ? 'active' : 'inactive'
                      }`}
                    >
                      Daily
                    </button>
                  </div>
                </div>
              </div>
              <div className="portfolio-holdings-list">
                {(state.portfolio.stocks || []).filter(stock => stock != null).map((stock, index) => {
                  // Use scraped currentPrice first, then fallback to buyPrice or averagePrice
                  // Ensure all values are valid numbers, defaulting to 0 if undefined/null/NaN
                  const currentPrice = safeParseFloat(
                    stock.currentPrice,
                    safeParseFloat(stock.buyPrice, safeParseFloat(stock.averagePrice))
                  );
                  const buyPrice = safeParseFloat(stock.buyPrice, safeParseFloat(stock.averagePrice));
                  const shares = safeParseFloat(stock.shares, safeParseFloat(stock.quantity));
                  
                  // Always calculate current value based on current price and shares
                  const currentValue = safeParseFloat(currentPrice * shares);
                  
                  // All-time gain/loss - ensure result is a valid number
                  const calculatedAllTimeGainLoss = (currentPrice - buyPrice) * shares;
                  const allTimeGainLoss = safeParseFloat(
                    stock.allTimeGainLoss,
                    safeParseFloat(calculatedAllTimeGainLoss)
                  );
                  
                  // All-time gain/loss percent
                  const calculatedAllTimeGainLossPercent = buyPrice > 0 ? (((currentPrice - buyPrice) / buyPrice) * 100) : 0;
                  const allTimeGainLossPercent = safeParseFloat(
                    stock.allTimeGainLossPercent,
                    safeParseFloat(calculatedAllTimeGainLossPercent)
                  );
                  
                  // Daily gain/loss - ensure result is a valid number
                  const dailyGainLoss = safeParseFloat(stock.dailyGainLoss);
                  const dailyGainLossPercent = safeParseFloat(stock.dailyGainLossPercent);
                  
                  return (
                    <div key={index} className="portfolio-holding-item">
                      <div className="portfolio-holding-header">
                        <div className="portfolio-holding-info">
                          <h4 className="portfolio-holding-symbol">{stock.symbol}</h4>
                          <p className="portfolio-holding-details">{shares} shares @ ${(isNaN(buyPrice) ? 0 : buyPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} avg</p>
                          <p className={`portfolio-holding-current-price ${
                            currentPrice > buyPrice ? 'positive' : 
                            currentPrice < buyPrice ? 'negative' : 'neutral'
                          }`}>
                            Current: ${(isNaN(currentPrice) ? 0 : currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="portfolio-holding-value">
                          <p className="portfolio-holding-total-value">${(isNaN(currentValue) ? 0 : currentValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className="portfolio-holding-total-label">Total Value</p>
                        </div>
                        <button
                          onClick={() => {
                            setStockToSell(stock);
                            setSellQuantity(1);
                            setShowSellModal(true);
                          }}
                          className="portfolio-sell-button"
                        >
                          Sell
                        </button>
                      </div>
                      
                      <div className="portfolio-holding-gainloss">
                        <div className="portfolio-holding-gainloss-values">
                          {gainLossView === 'alltime' ? (
                            <>
                              <p className={`portfolio-holding-gainloss-amount ${
                                allTimeGainLoss >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                              }`}>
                                {allTimeGainLoss >= 0 ? '+' : ''}${(isNaN(allTimeGainLoss) ? 0 : allTimeGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className={`portfolio-holding-gainloss-percent ${
                                allTimeGainLossPercent >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                              }`}>
                                {allTimeGainLossPercent >= 0 ? '+' : ''}{(isNaN(allTimeGainLossPercent) ? 0 : allTimeGainLossPercent).toFixed(1)}%
                              </p>
                            </>
                          ) : (
                            <>
                              <p className={`portfolio-holding-gainloss-amount ${
                                dailyGainLoss >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                              }`}>
                                {dailyGainLoss >= 0 ? '+' : ''}${(isNaN(dailyGainLoss) ? 0 : dailyGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className={`portfolio-holding-gainloss-percent ${
                                dailyGainLossPercent >= 0 ? 'portfolio-gainloss-positive' : 'portfolio-gainloss-negative'
                              }`}>
                                {dailyGainLossPercent >= 0 ? '+' : ''}{(isNaN(dailyGainLossPercent) ? 0 : dailyGainLossPercent).toFixed(1)}%
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="portfolio-mystocks-card"
            >
              <div className="portfolio-empty-state">
                <h3 className="portfolio-empty-title">My Stocks</h3>
                <p className="portfolio-empty-description">No stocks in your portfolio yet</p>
                <p className="portfolio-empty-debug">
                  Debug: Portfolio stocks array length: {state.portfolio.stocks ? state.portfolio.stocks.length : 'undefined'}
                </p>
                <p className="portfolio-empty-debug">
                  Portfolio state: {JSON.stringify(state.portfolio, null, 2)}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedStock && (
        <div className="portfolio-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="portfolio-modal"
          >
            <h3 className="portfolio-modal-title">
              Buy {selectedStock.symbol}
            </h3>
            <div className="portfolio-modal-content">
              <div className="portfolio-modal-field">
                <p className="portfolio-modal-label">Current Price</p>
                <p className="portfolio-modal-price">${selectedStock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="portfolio-modal-field">
                <label className="portfolio-modal-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="portfolio-modal-input"
                />
              </div>
              <div className="portfolio-modal-summary">
                <div className="portfolio-modal-summary-row">
                  <span>Total Cost:</span>
                  <span className="portfolio-modal-summary-value">${(selectedStock.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="portfolio-modal-summary-row">
                  <span>Available Balance:</span>
                  <span className="portfolio-modal-summary-value">${(state.portfolio.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="portfolio-modal-actions">
              <button
                onClick={() => setShowBuyModal(false)}
                className="portfolio-modal-button portfolio-modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyStock}
                disabled={selectedStock.price * quantity > state.portfolio.balance}
                className="portfolio-modal-button portfolio-modal-button-primary"
              >
                Buy Stock
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && stockToSell && (
        <div className="portfolio-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="portfolio-modal"
          >
            <h3 className="portfolio-modal-title">
              Sell {stockToSell.symbol}
            </h3>
            <div className="portfolio-modal-content">
              <div className="portfolio-modal-field">
                <p className="portfolio-modal-label">Current Price</p>
                <p className="portfolio-modal-price">
                  ${(stockToSell.currentPrice || stockToSell.buyPrice || stockToSell.averagePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="portfolio-modal-field">
                <p className="portfolio-modal-label">Shares Owned</p>
                <p className="portfolio-modal-price">{stockToSell.shares || stockToSell.quantity || 0} shares</p>
              </div>
              <div className="portfolio-modal-field">
                <label className="portfolio-modal-label">Quantity to Sell</label>
                <input
                  type="number"
                  min="1"
                  max={stockToSell.shares || stockToSell.quantity || 0}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                  className="portfolio-modal-input"
                />
              </div>
              <div className="portfolio-modal-summary">
                <div className="portfolio-modal-summary-row">
                  <span>Total Value:</span>
                  <span className="portfolio-modal-summary-value">
                    ${((stockToSell.currentPrice || stockToSell.buyPrice || stockToSell.averagePrice || 0) * sellQuantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="portfolio-modal-summary-row">
                  <span>Current Balance:</span>
                  <span className="portfolio-modal-summary-value">${(state.portfolio.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div className="portfolio-modal-actions">
              <button
                onClick={() => setShowSellModal(false)}
                className="portfolio-modal-button portfolio-modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSellStock}
                disabled={sellQuantity > stockToSell.shares || sellQuantity <= 0}
                className="portfolio-modal-button portfolio-modal-button-secondary"
              >
                Sell Stock
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Time Graph Modal */}
      {showTimeGraph && (
        <PortfolioTimeGraph onClose={() => setShowTimeGraph(false)} />
      )}

      {/* Bottom Navigation */}
      <div className="portfolio-bottom-nav">
        <button onClick={() => navigate('/dashboard')} className="portfolio-nav-item">
          <FaHome className="portfolio-nav-icon" />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/learn')} className="portfolio-nav-item">
          <FaGraduationCap className="portfolio-nav-icon" />
          <span>Learn</span>
        </button>
        <button onClick={() => navigate('/ask')} className="portfolio-nav-item">
          <FaQuestionCircle className="portfolio-nav-icon" />
          <span>Ask</span>
        </button>
        <button className="portfolio-nav-item active">
          <FaChartLine className="portfolio-nav-icon" />
          <span>Portfolio</span>
        </button>
      </div>
    </div>
  );
};

export default Portfolio;
