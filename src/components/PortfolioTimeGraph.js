import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';
import PortfolioService from '../services/PortfolioService';
import toast from 'react-hot-toast';
import './PortfolioTimeGraph.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

const PortfolioTimeGraph = ({ onClose }) => {
  const [graphData, setGraphData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedInterval, setSelectedInterval] = useState('daily');
  const [graphType, setGraphType] = useState('value'); // 'value', 'balance', 'volume', 'performance'
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadGraphData();
  }, [selectedPeriod, selectedInterval, graphType]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      let endpoint = '';
      if (graphType === 'value') {
        endpoint = `/portfolio/value-history?days=${selectedPeriod}&interval=${selectedInterval}`;
      } else if (graphType === 'balance') {
        endpoint = `/portfolio/balance-history?days=${selectedPeriod}`;
      } else if (graphType === 'volume') {
        endpoint = `/portfolio/analytics?days=${selectedPeriod}`;
      } else if (graphType === 'performance') {
        endpoint = `/portfolio/performance-enhanced?days=${selectedPeriod}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Portfolio data not found. Please try again.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (graphType === 'performance') {
        setPerformanceData(data.performance);
        setGraphData(null);
      } else {
        setGraphData(data);
        setPerformanceData(null);
      }
    } catch (error) {
      toast.error('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  const renderGraph = () => {
    if (graphType === 'performance' && performanceData) {
      return renderPerformanceGraph();
    }

    if (!graphData) return null;

    let dataPoints = [];
    let maxValue = 0;
    let minValue = Infinity;

    if (graphType === 'value') {
      dataPoints = graphData.valueHistory || [];
      if (dataPoints.length > 0) {
        const values = dataPoints.map(d => parseFloat(d.totalValue) || 0).filter(v => !isNaN(v));
        maxValue = values.length > 0 ? Math.max(...values) : 0;
        minValue = values.length > 0 ? Math.min(...values) : 0;
      }
    } else if (graphType === 'balance') {
      dataPoints = graphData.balanceHistory || [];
      if (dataPoints.length > 0) {
        const values = dataPoints.map(d => parseFloat(d.balance) || 0).filter(v => !isNaN(v));
        maxValue = values.length > 0 ? Math.max(...values) : 0;
        minValue = values.length > 0 ? Math.min(...values) : 0;
      }
    } else if (graphType === 'volume') {
      dataPoints = graphData.dailyVolume || [];
      if (dataPoints.length > 0) {
        const values = dataPoints.map(d => parseFloat(d.volume) || 0).filter(v => !isNaN(v));
        maxValue = values.length > 0 ? Math.max(...values) : 0;
        minValue = values.length > 0 ? Math.min(...values) : 0;
      }
    }

    if (dataPoints.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FaChartLine className="text-4xl mb-2 mx-auto" />
            <p>No data available for the selected period</p>
            <p className="text-sm mt-2">Try selecting a different time period or graph type</p>
          </div>
        </div>
      );
    }

    // Check if all data points have valid values
    const hasValidData = dataPoints.some(point => {
      const value = parseFloat(point[graphType === 'value' ? 'totalValue' : graphType === 'balance' ? 'balance' : 'volume']);
      return !isNaN(value) && value > 0;
    });

    if (!hasValidData) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FaChartLine className="text-4xl mb-2 mx-auto" />
            <p>No valid data points found</p>
            <p className="text-sm mt-2">The data may be incomplete or corrupted</p>
          </div>
        </div>
      );
    }

    // Ensure we have valid values
    if (isNaN(maxValue) || isNaN(minValue) || maxValue === minValue) {
      maxValue = 1000; // Default fallback
      minValue = 0;
    }

    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);

    return (
      <div className="relative">
        <svg width="100%" height="500" className="border rounded-lg bg-white" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1="50"
                y1={50 + ratio * 200}
                x2="100%"
                y2={50 + ratio * 200}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x="40"
                y={50 + ratio * 200 + 5}
                fontSize="12"
                fill="#6b7280"
                textAnchor="end"
              >
                ${Math.round(adjustedMax - (ratio * (adjustedMax - adjustedMin))).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Data line */}
          <polyline
            points={dataPoints.map((point, index) => {
              const x = 50 + (index / Math.max(dataPoints.length - 1, 1)) * (window.innerWidth - 150);
              const value = parseFloat(point[graphType === 'value' ? 'totalValue' : graphType === 'balance' ? 'balance' : 'volume']) || 0;
              const y = 50 + ((adjustedMax - value) / Math.max(adjustedMax - adjustedMin, 1)) * 200;
              
              // Ensure valid coordinates
              const validX = isNaN(x) ? 50 : Math.max(50, Math.min(window.innerWidth - 100, x));
              const validY = isNaN(y) ? 150 : Math.max(50, Math.min(250, y));
              
              return `${validX},${validY}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = 50 + (index / Math.max(dataPoints.length - 1, 1)) * (window.innerWidth - 150);
            const value = parseFloat(point[graphType === 'value' ? 'totalValue' : graphType === 'balance' ? 'balance' : 'volume']) || 0;
            const y = 50 + ((adjustedMax - value) / Math.max(adjustedMax - adjustedMin, 1)) * 200;
            
            // Ensure valid coordinates
            const validX = isNaN(x) ? 50 : Math.max(50, Math.min(window.innerWidth - 100, x));
            const validY = isNaN(y) ? 150 : Math.max(50, Math.min(250, y));
            
            return (
              <circle
                key={index}
                cx={validX}
                cy={validY}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
                title={`${point.date}: $${value.toLocaleString()}`}
              />
            );
          })}

          {/* X-axis labels */}
          {dataPoints.filter((_, index) => index % Math.ceil(dataPoints.length / 5) === 0).map((point, index) => {
            const originalIndex = index * Math.ceil(dataPoints.length / 5);
            const x = 50 + (originalIndex / Math.max(dataPoints.length - 1, 1)) * (window.innerWidth - 150);
            const validX = isNaN(x) ? 50 : Math.max(50, Math.min(window.innerWidth - 100, x));
            
            return (
              <text
                key={index}
                x={validX}
                y="280"
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>

        {/* Graph stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600 font-semibold">Current</div>
            <div className="text-lg font-bold">
              ${graphData.currentValue || graphData.currentBalance || 'N/A'}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600 font-semibold">Max</div>
            <div className="text-lg font-bold">${maxValue.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-red-600 font-semibold">Min</div>
            <div className="text-lg font-bold">${minValue.toLocaleString()}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceGraph = () => {
    if (!performanceData || !performanceData.dailyReturns || performanceData.dailyReturns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FaChartLine className="text-4xl mb-2 mx-auto" />
            <p>No performance data available</p>
            <p className="text-sm mt-2">Performance metrics require historical data. Try creating some snapshots first.</p>
            <button
              onClick={createSnapshot}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create First Snapshot
            </button>
          </div>
        </div>
      );
    }

    const returns = performanceData.dailyReturns.map(r => r.return);
    const maxReturn = Math.max(...returns);
    const minReturn = Math.min(...returns);
    const range = maxReturn - minReturn;
    const padding = range * 0.1;
    const adjustedMax = maxReturn + padding;
    const adjustedMin = minReturn - padding;

    return (
      <div className="space-y-6">
        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 font-semibold text-sm">Total Return</div>
            <div className="text-lg font-bold">
              {performanceData.totalReturn !== null && performanceData.totalReturn !== undefined 
                ? `${performanceData.totalReturn >= 0 ? '+' : ''}$${performanceData.totalReturn.toFixed(2)}`
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">
              {performanceData.totalReturnPercent !== null && performanceData.totalReturnPercent !== undefined
                ? `${performanceData.totalReturnPercent >= 0 ? '+' : ''}${performanceData.totalReturnPercent.toFixed(2)}%`
                : 'N/A'
              }
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 font-semibold text-sm">Volatility</div>
            <div className="text-lg font-bold">
              {performanceData.volatility !== null && performanceData.volatility !== undefined
                ? `${performanceData.volatility.toFixed(2)}%`
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Daily</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 font-semibold text-sm">Sharpe Ratio</div>
            <div className="text-lg font-bold">
              {performanceData.sharpeRatio !== null && performanceData.sharpeRatio !== undefined
                ? performanceData.sharpeRatio.toFixed(2)
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Risk-Adjusted</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-600 font-semibold text-sm">Max Drawdown</div>
            <div className="text-lg font-bold">
              {performanceData.maxDrawdown !== null && performanceData.maxDrawdown !== undefined
                ? `${performanceData.maxDrawdown.toFixed(2)}%`
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Peak to Trough</div>
          </div>
        </div>

        {/* Daily Returns Chart */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Daily Returns</h3>
          <svg width="100%" height="300" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <g key={index}>
                <line
                  x1="50"
                  y1={50 + ratio * 200}
                  x2="100%"
                  y2={50 + ratio * 200}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="40"
                  y={50 + ratio * 200 + 5}
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {((adjustedMax - (ratio * (adjustedMax - adjustedMin)))).toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Zero line */}
            <line
              x1="50"
              y1={50 + ((adjustedMax - 0) / (adjustedMax - adjustedMin)) * 200}
              x2="100%"
              y2={50 + ((adjustedMax - 0) / (adjustedMax - adjustedMin)) * 200}
              stroke="#374151"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Returns bars */}
            {performanceData.dailyReturns.map((dayReturn, index) => {
              const x = 50 + (index / Math.max(performanceData.dailyReturns.length - 1, 1)) * (window.innerWidth - 150);
              const height = Math.abs(dayReturn.return) / (adjustedMax - adjustedMin) * 200;
              const y = 50 + ((adjustedMax - Math.max(0, dayReturn.return)) / (adjustedMax - adjustedMin)) * 200;
              const color = dayReturn.return >= 0 ? '#10b981' : '#ef4444';
              
              return (
                <rect
                  key={index}
                  x={x - 2}
                  y={y}
                  width="4"
                  height={height}
                  fill={color}
                  opacity="0.7"
                  title={`${dayReturn.date}: ${dayReturn.return >= 0 ? '+' : ''}${dayReturn.return.toFixed(2)}%`}
                />
              );
            })}
          </svg>
        </div>

        {/* Best/Worst Days */}
        {(performanceData.bestDay || performanceData.worstDay) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceData.bestDay && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-lg icon-trend-up"></span>
                  <span className="text-green-600 font-semibold">Best Day</span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {performanceData.bestDay.return !== null && performanceData.bestDay.return !== undefined
                    ? `${performanceData.bestDay.return >= 0 ? '+' : ''}${performanceData.bestDay.return.toFixed(2)}%`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(performanceData.bestDay.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {performanceData.worstDay && (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-lg icon-trend-down"></span>
                  <span className="text-red-600 font-semibold">Worst Day</span>
                </div>
                <div className="text-lg font-bold text-red-700">
                  {performanceData.worstDay.return !== null && performanceData.worstDay.return !== undefined
                    ? `${performanceData.worstDay.return >= 0 ? '+' : ''}${performanceData.worstDay.return.toFixed(2)}%`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(performanceData.worstDay.date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const createSnapshot = async () => {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/portfolio/create-snapshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      toast.success('Portfolio snapshot created successfully');
      
      loadGraphData();
    } catch (error) {
      toast.error('Failed to create snapshot');
    }
  };

  const exportData = () => {
    if (graphType === 'performance' && performanceData) {
      let csvContent = 'Date,Daily Return\n';
      csvContent += performanceData.dailyReturns.map(day => 
        `${day.date},${day.return}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-performance-${selectedPeriod}days.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Performance data exported successfully');
      return;
    }

    if (!graphData) return;

    let csvContent = '';
    if (graphType === 'value' && graphData.valueHistory) {
      csvContent = 'Date,Total Value,Balance,Daily Change,Daily Change %\n';
      csvContent += graphData.valueHistory.map(point => 
        `${point.date},${point.totalValue},${point.balance},${point.dailyChange || 0},${point.dailyChangePercent || 0}`
      ).join('\n');
    } else if (graphType === 'balance' && graphData.balanceHistory) {
      csvContent = 'Date,Balance,Cumulative Invested,Cumulative Sold\n';
      csvContent += graphData.balanceHistory.map(point => 
        `${point.date},${point.balance},${point.cumulativeInvested},${point.cumulativeSold}`
      ).join('\n');
    } else if (graphType === 'volume' && graphData.dailyVolume) {
      csvContent = 'Date,Volume,Transactions\n';
      csvContent += graphData.dailyVolume.map(point => 
        `${point.date},${point.volume},${point.transactions}`
      ).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${graphType}-${selectedPeriod}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaChartLine className="text-2xl" />
              <div>
                <h2 className="text-2xl font-bold">Portfolio Time Graph</h2>
                <p className="text-blue-100">Visualize your portfolio performance over time</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 text-3xl font-bold w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              title="Close graph"
            >
              ×
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Graph Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 icon-graph">Graph Type</label>
              <select
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="value">Portfolio Value</option>
                <option value="balance">Account Balance</option>
                <option value="volume">Transaction Volume</option>
                <option value="performance">Performance Metrics</option>
              </select>
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 icon-calendar">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
              </select>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 icon-clock">Interval</label>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={graphType === 'balance' || graphType === 'volume'}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-end space-x-2">
              <button
                onClick={loadGraphData}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 icon-refresh"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={createSnapshot}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 icon-snapshot"
                title="Create manual snapshot"
              >
                Snapshot
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 icon-download"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Graph Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading {graphType} data...</span>
            </div>
          ) : (
            renderGraph()
          )}
        </div>

        {/* Analytics Toggle */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 icon-settings"
          >
            <span>{showAnalytics ? 'Hide' : 'Show'} Analytics</span>
          </button>

          {showAnalytics && (graphData || performanceData) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Data Points</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {graphType === 'performance' 
                    ? performanceData?.dataPoints || 0
                    : graphData?.valueHistory?.length || graphData?.balanceHistory?.length || graphData?.dailyVolume?.length || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Period</h4>
                <p className="text-lg font-bold text-green-600">
                  {graphType === 'performance' 
                    ? performanceData?.period || 'N/A'
                    : graphData?.period || 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Data Source</h4>
                <p className="text-sm font-bold text-purple-600">
                  {graphData?.dataSource || 'Historical Snapshots'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                <p className="text-sm font-bold text-orange-600">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
};

export default PortfolioTimeGraph;
