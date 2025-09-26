const fetch = require('node-fetch');

async function testSofiaMatches() {
  try {
    // Login as Sofia
    console.log('Logging in as Sofia...');
    const loginResponse = await fetch('http://localhost:8888/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sofia@test.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful!');
    const token = loginData.token;

    // Test matches endpoint
    console.log('Fetching matches...');
    const matchesResponse = await fetch('http://localhost:8888/api/users/matches', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!matchesResponse.ok) {
      console.error('Matches request failed:', await matchesResponse.text());
      return;
    }

    const matches = await matchesResponse.json();
    console.log('Matches response:', JSON.stringify(matches, null, 2));
    console.log('Number of matches:', matches.length);

  } catch (error) {
    console.error('Error:', error);
  }
}

testSofiaMatches();