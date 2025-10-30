const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

class FactsService {
  // Get today's fact
  static async getTodaysFact() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/facts/today`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch today\'s fact');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get all facts
  static async getAllFacts(page = 1, limit = 10, category = null) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const params = new URLSearchParams({ page, limit });
      if (category) params.append('category', category);

      const response = await fetch(`${API_BASE_URL}/facts?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch facts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get fact by ID
  static async getFactById(id) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const response = await fetch(`${API_BASE_URL}/facts/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fact');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get user's completed facts
  static async getCompletedFacts(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({ page, limit });
      const response = await fetch(`${API_BASE_URL}/facts/user/completed?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch completed facts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get fact categories
  static async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/facts/categories/list`);

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Search facts
  static async searchFacts(query, page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      const params = new URLSearchParams({ page, limit });
      const response = await fetch(`${API_BASE_URL}/facts/search/${encodeURIComponent(query)}?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search facts');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default FactsService;

