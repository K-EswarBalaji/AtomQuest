const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

const run = async () => {
  try {
    console.log('Calling health...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('Health:', health.data);

    console.log('Logging in as manager...');
    const login = await axios.post(`${API}/auth/login`, {
      email: 'manager@company.com',
      password: 'password123'
    });

    const token = login.data.token;
    console.log('Login successful, token length=', token.length);

    const headers = { Authorization: `Bearer ${token}` };

    console.log('Fetching active cycle...');
    const cycleRes = await axios.get(`${API}/cycles/active`, { headers });
    console.log('Active cycle:', cycleRes.data);

    const cycleId = cycleRes.data?.id;
    console.log('Calling team status for cycleId=', cycleId);
    const statusRes = await axios.get(`${API}/check-ins/team/status?cycleId=${cycleId}`, { headers });
    console.log('Team status response:', JSON.stringify(statusRes.data, null, 2));
  } catch (err) {
    console.error('Live checks failed:', err.response?.data || err.message);
    process.exit(1);
  }
};

run();
