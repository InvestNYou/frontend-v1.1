const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

// Debug logging utility for frontend
const debugLog = (method, message, data = {}) => {
  if (process.env.NODE_ENV === 'development' || localStorage.getItem('ask-debug') === 'true') {
    const timestamp = new Date().toISOString();
    console.log(`[ASK SERVICE DEBUG] ${timestamp}`);
    console.log(`[METHOD: ${method}] ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(`[DATA]`, data);
    }
  }
};

const errorLog = (method, error, context = {}) => {
  const timestamp = new Date().toISOString();
  console.error(`[ASK SERVICE ERROR] ${timestamp}`);
  console.error(`[METHOD: ${method}] Error occurred`);
  console.error(`[ERROR]`, error);
  if (Object.keys(context).length > 0) {
    console.error(`[CONTEXT]`, context);
  }
};

class AskService {
  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    const token = localStorage.getItem('moneysmart-token');
    if (!token) {
      return null;
    }
    
    // Basic token validation
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp < currentTime) {
        localStorage.removeItem('moneysmart-token');
        return null;
      }
      return token;
    } catch (error) {
      localStorage.removeItem('moneysmart-token');
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    const requestId = Math.random().toString(36).substring(7);
    const token = this.getAuthToken();
    
    debugLog('makeRequest', `Making request to ${endpoint}`, {
      requestId,
      hasToken: !!token,
      method: options.method || 'GET',
      endpoint: `${API_BASE_URL}${endpoint}`
    });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const responseTime = Date.now() - startTime;
      
      debugLog('makeRequest', `Response received`, {
        requestId,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        errorLog('makeRequest', error, {
          requestId,
          status: response.status,
          endpoint,
          errorData
        });
        throw error;
      }

      const data = await response.json();
      debugLog('makeRequest', 'Request successful', {
        requestId,
        responseTime: `${responseTime}ms`,
        hasData: !!data
      });
      
      return data;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Unable to connect to the server. Please check if the backend is running.');
        errorLog('makeRequest', networkError, {
          requestId,
          endpoint,
          responseTime: `${responseTime}ms`,
          originalError: error.message
        });
        throw networkError;
      }
      errorLog('makeRequest', error, {
        requestId,
        endpoint,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  }

  /**
   * Ask AI a question with conversation history
   */
  async askQuestion(message) {
    const requestId = Math.random().toString(36).substring(7);
    debugLog('askQuestion', 'Asking question', {
      requestId,
      messageLength: message?.length || 0,
      messagePreview: message?.substring(0, 100) || 'No message'
    });
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest('/ask/question', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      const responseTime = Date.now() - startTime;

      debugLog('askQuestion', 'Question answered', {
        requestId,
        success: response.success,
        responseTime: `${responseTime}ms`,
        answerLength: response.data?.answer?.length || 0,
        requestIdFromServer: response.requestId
      });

      return response;
    } catch (error) {
      errorLog('askQuestion', error, {
        requestId,
        messageLength: message?.length || 0
      });
      throw error;
    }
  }

  /**
   * Ask AI a quick question without conversation history
   */
  async askQuickQuestion(message) {
    try {
      const response = await this.makeRequest('/ask/quick', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(page = 1, limit = 20) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        // Return empty history instead of throwing error
        return {
          success: true,
          data: {
            messages: [],
            pagination: {
              page: 1,
              limit: limit,
              total: 0,
              pages: 0
            }
          }
        };
      }
      
      const response = await this.makeRequest(`/ask/history?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      // Return empty history on error instead of throwing
      return {
        success: false,
        data: {
          messages: [],
          pagination: {
            page: 1,
            limit: limit,
            total: 0,
            pages: 0
          }
        },
        error: error.message
      };
    }
  }

  /**
   * Get suggested questions (no authentication required)
   */
  async getSuggestions() {
    try {
      const response = await fetch(`${API_BASE_URL}/ask/suggestions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    try {
      const response = await this.makeRequest('/ask/history', {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get AI service status
   */
  async getStatus() {
    try {
      const response = await this.makeRequest('/ask/status');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getStats(startDate = null, endDate = null) {
    try {
      let url = '/ask/stats';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await this.makeRequest(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if AI service is available (no authentication required)
   */
  async isServiceAvailable() {
    const requestId = Math.random().toString(36).substring(7);
    debugLog('isServiceAvailable', 'Checking service availability', { requestId });
    
    try {
      // First try the /ask/status endpoint which returns AI-specific status
      const statusUrl = `${API_BASE_URL}/ask/status`;
      debugLog('isServiceAvailable', 'Checking AI status endpoint', { requestId, url: statusUrl });
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const status = await response.json();
        const isAvailable = status.success && status.data?.available === true;
        
        debugLog('isServiceAvailable', 'Service status retrieved', {
          requestId,
          available: isAvailable,
          model: status.data?.model,
          hasApiKey: status.data?.hasApiKey
        });
        
        return isAvailable;
      }
      
      debugLog('isServiceAvailable', 'Status endpoint returned error', {
        requestId,
        status: response.status,
        statusText: response.statusText
      });
      
      // Fallback to general health check
      const healthUrl = `${API_BASE_URL.replace('/api', '')}/health`;
      debugLog('isServiceAvailable', 'Fallback to health endpoint', { requestId, url: healthUrl });
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        const isAvailable = health.status === 'OK';
        
        debugLog('isServiceAvailable', 'Health check completed', {
          requestId,
          available: isAvailable,
          status: health.status
        });
        
        return isAvailable;
      }
      
      return false;
    } catch (error) {
      if (error.name === 'AbortError') {
        errorLog('isServiceAvailable', new Error('Service availability check timed out'), { requestId });
      } else {
        errorLog('isServiceAvailable', error, { requestId });
      }
      return false;
    }
  }

  /**
   * Get debug information about the AI service
   */
  async getDebugInfo() {
    const requestId = Math.random().toString(36).substring(7);
    debugLog('getDebugInfo', 'Fetching debug information', { requestId });
    
    try {
      const response = await fetch(`${API_BASE_URL}/ask/debug`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const debugInfo = await response.json();
      debugLog('getDebugInfo', 'Debug info retrieved', { requestId, debugInfo });
      
      return debugInfo;
    } catch (error) {
      errorLog('getDebugInfo', error, { requestId });
      throw error;
    }
  }
}

export default new AskService();
