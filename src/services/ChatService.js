const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

class ChatService {
  // Get chat history
  static async getChatHistory(page = 1, limit = 20) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/chat/history?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Send message
  static async sendMessage(message, context = {}) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Clear chat history
  static async clearChatHistory() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get chat statistics
  static async getChatStats() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/chat/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat statistics');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default ChatService;
