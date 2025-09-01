// Debug script לבדיקת טוקנים
// הפעל בתור console script בבראוזר

console.log("🔍 Auth Debug Information:");
console.log("Token:", localStorage.getItem('access_token'));
console.log("Refresh Token:", localStorage.getItem('refresh_token'));
console.log("User:", JSON.parse(localStorage.getItem('user') || 'null'));

// Test API call
const testAuth = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('❌ No access token found');
    return;
  }

  try {
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Profile API Response Status:', response.status);
    if (response.ok) {
      console.log('✅ Auth token is valid');
    } else {
      console.log('❌ Auth token is invalid or expired');
    }
  } catch (error) {
    console.error('❌ API call failed:', error);
  }
};

testAuth();