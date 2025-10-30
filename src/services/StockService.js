const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

class StockService {
  // Get stock data
  static async getStocks(symbols = null, limit = 20) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const params = new URLSearchParams();
      
      if (symbols) {
        params.append('symbols', symbols.join(','));
      }
      params.append('limit', limit);

      const response = await fetch(`${API_BASE_URL}/stocks?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get specific stock
  static async getStock(symbol) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Search stocks
  static async searchStocks(query, limit = 10) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/search/${encodeURIComponent(query)}?limit=${limit}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get stock price
  static async getStockPrice(symbol) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/price`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get stock history
  static async getStockHistory(symbol, days = 30) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/history?days=${days}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get trending stocks (up)
  static async getTrendingUp(limit = 10) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/trending/up?limit=${limit}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending stocks');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get trending stocks (down)
  static async getTrendingDown(limit = 10) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/trending/down?limit=${limit}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending stocks');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get market overview
  static async getMarketOverview() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/stocks/market/overview`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market overview');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default StockService;
