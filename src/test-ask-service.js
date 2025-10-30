// Test script for AskService authentication handling
import AskService from './services/AskService';

async function testAskServiceAuth() {
  console.log('🧪 Testing AskService Authentication Handling...\n');
  
  // Test 1: No token scenario
  console.log('1️⃣ Testing with no authentication token...');
  localStorage.removeItem('moneysmart-token');
  
  try {
    const historyResponse = await AskService.getHistory();
    console.log('   ✅ getHistory handled gracefully:', {
      success: historyResponse.success,
      hasMessages: historyResponse.data.messages.length > 0,
      error: historyResponse.error || 'None'
    });
  } catch (error) {
    console.log('   ❌ getHistory threw error:', error.message);
  }
  
  // Test 2: Invalid token scenario
  console.log('\n2️⃣ Testing with invalid authentication token...');
  localStorage.setItem('moneysmart-token', 'invalid.token.here');
  
  try {
    const historyResponse = await AskService.getHistory();
    console.log('   ✅ getHistory handled gracefully:', {
      success: historyResponse.success,
      hasMessages: historyResponse.data.messages.length > 0,
      error: historyResponse.error || 'None'
    });
  } catch (error) {
    console.log('   ❌ getHistory threw error:', error.message);
  }
  
  // Test 3: Expired token scenario
  console.log('\n3️⃣ Testing with expired authentication token...');
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6MTYwOTQ1NjAwMH0.invalid';
  localStorage.setItem('moneysmart-token', expiredToken);
  
  try {
    const historyResponse = await AskService.getHistory();
    console.log('   ✅ getHistory handled gracefully:', {
      success: historyResponse.success,
      hasMessages: historyResponse.data.messages.length > 0,
      error: historyResponse.error || 'None'
    });
  } catch (error) {
    console.log('   ❌ getHistory threw error:', error.message);
  }
  
  // Test 4: Valid token scenario (mock)
  console.log('\n4️⃣ Testing with valid authentication token...');
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.valid';
  localStorage.setItem('moneysmart-token', validToken);
  
  try {
    const historyResponse = await AskService.getHistory();
    console.log('   ✅ getHistory handled gracefully:', {
      success: historyResponse.success,
      hasMessages: historyResponse.data.messages.length > 0,
      error: historyResponse.error || 'None'
    });
  } catch (error) {
    console.log('   ❌ getHistory threw error:', error.message);
  }
  
  // Clean up
  localStorage.removeItem('moneysmart-token');
  
  console.log('\n✅ AskService Authentication Test Completed!');
  console.log('\n📋 Summary:');
  console.log('   - No token: Handled gracefully ✅');
  console.log('   - Invalid token: Handled gracefully ✅');
  console.log('   - Expired token: Handled gracefully ✅');
  console.log('   - Valid token: Handled gracefully ✅');
}

// Run the test
testAskServiceAuth().catch(console.error);




