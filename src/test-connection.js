// Test script to verify frontend-backend connection
const axios = require('axios');

async function testConnection() {
  console.log('🧪 Testing frontend-backend connection...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Registration
    console.log('\n2. Testing registration...');
    const registrationData = {
      name: 'Test User',
      email: 'testuser@example.com',
      ageRange: '25-34',
      financialGoal: 'investing',
      learningMode: 'facts'
    };
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registrationData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    // Test 3: Login
    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'testuser@example.com'
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    
    console.log('\n🎉 All tests passed! Frontend should be able to connect to backend.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testConnection();

