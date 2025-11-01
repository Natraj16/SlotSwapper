/**
 * Quick test script to verify signup endpoint is working
 * Run with: node test-signup.js
 */

const testSignup = async () => {
  try {
    console.log('🧪 Testing Signup Endpoint...\n');

    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`, // Unique email
        password: 'test123456',
      }),
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Signup endpoint is working!');
      console.log('Token:', data.token ? '✓ Generated' : '✗ Missing');
      console.log('User:', data.user ? '✓ Created' : '✗ Missing');
    } else {
      console.log('\n❌ Signup failed:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error testing signup:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend server is running (npm run dev)');
    console.log('2. MongoDB is connected');
    console.log('3. Port 3001 is accessible');
  }
};

testSignup();
