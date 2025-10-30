const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sea-lion-app-7poo7.ondigitalocean.app/api';

// Debug: Log the API base URL

class ProgressService {
  //getting user progress
  static async getProgress() {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // update user progress
  static async updateProgress(progressData) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // adding xp
  static async addXp(amount) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress/xp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        throw new Error('Failed to add XP');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  //streak updater
  static async updateStreak(increment = 1) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress/streak`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ increment })
      });

      if (!response.ok) {
        throw new Error('Failed to update streak');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // + Badge
  static async addBadge(badge) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress/badges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ badge })
      });

      if (!response.ok) {
        throw new Error('Failed to add badge');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Fact Completion
  static async completeFact(factId) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/progress/complete-fact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ factId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete fact');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Complete a lesson
  static async completeLesson(lessonId) {
    try {
      console.log('[ProgressService] completeLesson called with lessonId:', lessonId);
      console.log('[ProgressService] lessonId type:', typeof lessonId);
      console.log('[ProgressService] lessonId value:', lessonId);
      
      const token = localStorage.getItem('moneysmart-token');
      if (!token) {
        console.error('[ProgressService] No authentication token found');
        throw new Error('Authentication required');
      }

      const requestBody = { lessonId };
      console.log('[ProgressService] Request body:', requestBody);
      console.log('[ProgressService] Stringified body:', JSON.stringify(requestBody));
      console.log('[ProgressService] API URL:', `${API_BASE_URL}/progress/complete-lesson`);

      const response = await fetch(`${API_BASE_URL}/progress/complete-lesson`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[ProgressService] Response status:', response.status);
      console.log('[ProgressService] Response ok:', response.ok);
      console.log('[ProgressService] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ProgressService] Error response body:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('[ProgressService] Parsed error data:', errorData);
        } catch (e) {
          console.error('[ProgressService] Could not parse error response as JSON');
        }
        throw new Error(errorData?.error || `Failed to complete lesson: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ProgressService] Success response:', data);
      return data;
    } catch (error) {
      console.error('[ProgressService] Exception in completeLesson:', error);
      console.error('[ProgressService] Error message:', error.message);
      console.error('[ProgressService] Error stack:', error.stack);
      throw error;
    }
  }

  // Quiz methods
  static async getQuiz(quizId) {
    try {
      console.debug('[ProgressService.getQuiz] Requesting quiz', { quizId, url: `${API_BASE_URL}/quizzes/${quizId}` });
      const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.debug('[ProgressService.getQuiz] Response meta', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      try {
        const hdrs = Object.fromEntries(response.headers.entries());
        console.debug('[ProgressService.getQuiz] Response headers', hdrs);
      } catch (_) {}
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch quiz: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const returned = data?.quiz ?? data;
      console.debug('[ProgressService.getQuiz] Parsed body keys', { keys: Object.keys(data || {}), hasQuizKey: !!data?.quiz });
      console.debug('[ProgressService.getQuiz] Returned quiz summary', {
        hasQuestions: Array.isArray(returned?.questions),
        questionsLength: Array.isArray(returned?.questions) ? returned.questions.length : null,
        title: returned?.title,
        id: returned?.id
      });
      return returned;
    } catch (error) {
      console.error('[ProgressService.getQuiz] Error', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  static async submitQuizAttempt(quizId, attemptData) {
    try {
      const token = localStorage.getItem('moneysmart-token');
      // Backend expects '/submit' endpoint
      const url = `${API_BASE_URL}/quizzes/${quizId}/submit`;
      
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attemptData)
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit quiz attempt: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Error details logged
      throw error;
    }
  }

  static async getQuizAttempts(quizId) {
    try {
      const url = `${API_BASE_URL}/quizzes/${quizId}/attempts`;
      console.debug('[ProgressService.getQuizAttempts] Request', { quizId, url });
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.debug('[ProgressService.getQuizAttempts] Response meta', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ProgressService.getQuizAttempts] Error body', errorText);
        throw new Error('Failed to fetch quiz attempts');
      }

      const data = await response.json();
      console.debug('[ProgressService.getQuizAttempts] Attempts count', Array.isArray(data) ? data.length : null);
      return data;
    } catch (error) {
      console.error('[ProgressService.getQuizAttempts] Error', { message: error.message });
      throw error;
    }
  }

  static async getLessonQuizAttempts(lessonId) {
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/lesson/${lessonId}/attempts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson quiz attempts');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Unit test methods
  static async getUnitTest(testId) {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unit test');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async submitUnitTestAttempt(testId, attemptData) {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-tests/${testId}/attempt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('moneysmart-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attemptData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit unit test attempt');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default ProgressService;

