const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

class WatchlistService {
  // Get user's watchlist
  static async getWatchlist() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Add stock to watchlist
  static async addToWatchlist(symbol, name = null, price = 0) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/watchlist/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, name, price })
      });

      if (!response.ok) {
        throw new Error('Failed to add stock to watchlist');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Remove stock from watchlist
  static async removeFromWatchlist(symbol) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/watchlist/remove/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove stock from watchlist');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Update watchlist stock price
  static async updateWatchlistPrice(symbol, price) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/watchlist/update-price/${symbol}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price })
      });

      if (!response.ok) {
        throw new Error('Failed to update watchlist price');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get watchlist with current prices
  static async getWatchlistWithPrices() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/watchlist/with-prices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist with prices');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default WatchlistService;
