// Quick Diagnostic Script untuk Login Issues
// Jalan ini di browser console (F12 → Console)

// ============================================
// 1. TEST BACKEND CONNECTION
// ============================================
console.log('=== DIAGNOSTIC TEST START ===\n');

// Test 1: Check if backend is reachable
console.log('Test 1: Backend Connectivity');
console.log('Trying to reach: http://localhost:5000/api/auth/login\n');

fetch('http://localhost:5000/api/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ Backend is reachable!');
  console.log('   Status:', response.status);
  console.log('   Status Text:', response.statusText);
  return response;
})
.catch(error => {
  console.error('❌ Backend is NOT reachable!');
  console.error('   Error:', error.message);
  console.error('   This usually means:');
  console.error('   1. Backend server is not running');
  console.error('   2. Backend is not on port 5000');
  console.error('   3. Port 5000 is blocked');
});

// ============================================
// 2. TEST LOGIN REQUEST
// ============================================
console.log('\nTest 2: Login Request (with demo credentials)');
console.log('Email: fikri@madura.com');
console.log('Password: fikri123\n');

fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'fikri@madura.com',
    password: 'fikri123'
  })
})
.then(response => {
  console.log('Response Status:', response.status);
  
  if (response.status === 200) {
    console.log('✅ Login endpoint working!');
  } else if (response.status === 401) {
    console.log('⚠️  Login endpoint working but credentials failed');
  } else if (response.status === 404) {
    console.log('❌ Login endpoint not found (wrong path?)');
  } else if (response.status === 500) {
    console.log('❌ Server error in backend');
  }
  
  return response.json();
})
.then(data => {
  console.log('Response Body:', data);
  
  if (data.success) {
    console.log('✅ Login successful!');
    console.log('   User:', data.data?.user?.email);
    console.log('   Token received:', !!data.data?.token);
  } else {
    console.log('❌ Login failed');
    console.log('   Error:', data.error || data.message);
  }
})
.catch(error => {
  console.error('❌ Request failed:', error.message);
});

// ============================================
// 3. CHECK LOCAL STORAGE
// ============================================
console.log('\nTest 3: LocalStorage Check');
const storedUser = localStorage.getItem('madura_user');
const storedToken = localStorage.getItem('madura_token');

console.log('Stored User:', storedUser ? 'YES ✅' : 'NO ❌');
console.log('Stored Token:', storedToken ? 'YES ✅' : 'NO ❌');

if (storedUser) {
  console.log('User data:', JSON.parse(storedUser));
}

// ============================================
// 4. CHECK API CONFIG
// ============================================
console.log('\nTest 4: API Configuration');
console.log('Current Base URL:', 'http://localhost:5000/api');
console.log('Expected Pattern: http://[backend-host]:[port]/api');

// ============================================
// 5. CHECK NETWORK ISSUES
// ============================================
console.log('\nTest 5: Network Information');
console.log('Browser: ', navigator.userAgent.split(' ')[navigator.userAgent.split(' ').length - 1]);
console.log('Online:', navigator.onLine ? '✅ YES' : '❌ NO');

if (!navigator.onLine) {
  console.warn('⚠️  Browser is OFFLINE! Connect to internet first.');
}

console.log('\n=== DIAGNOSTIC TEST END ===');
console.log('\nInterpret Results:');
console.log('1. If Test 1 fails: Backend not running or wrong port');
console.log('2. If Test 2 fails but Test 1 passes: Check endpoint path');
console.log('3. If Test 2 returns 401: Check credentials in database');
console.log('4. If Tests pass but login still fails: Check console for other errors');
