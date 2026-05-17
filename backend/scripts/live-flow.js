const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

const pause = ms => new Promise(r => setTimeout(r, ms));

const run = async () => {
  try {
    console.log('1) Login as employee');
    const empLogin = await axios.post(`${API}/auth/login`, {
      email: 'employee@company.com',
      password: 'password123'
    });
    const empToken = empLogin.data.token;

    console.log('2) Get active cycle');
    const cycleRes = await axios.get(`${API}/cycles/active`, { headers: { Authorization: `Bearer ${empToken}` } });
    const cycle = cycleRes.data;
    console.log('  activeCycle id=', cycle.id);

    console.log('3) Create a new goal as employee');
    const createRes = await axios.post(`${API}/goals`, {
      thrustArea: 'PRODUCT',
      title: 'E2E flow test goal',
      description: 'Created by live-flow script',
      unitOfMeasurement: 'NUMERIC',
      target: 100,
      weightage: 10,
      cycleId: cycle.id
    }, { headers: { Authorization: `Bearer ${empToken}` } });
    const createdGoal = createRes.data.goal;
    console.log('  created goal id=', createdGoal.id);

    // Ensure total weightage sums to 100 before submitting
    const myGoalsRes = await axios.get(`${API}/goals/employee/me?cycleId=${cycle.id}`, { headers: { Authorization: `Bearer ${empToken}` } });
    const myGoals = myGoalsRes.data;
    const total = myGoals.reduce((s, g) => s + parseFloat(g.weightage || 0), 0);
    console.log('  current total weightage:', total);

    if (Math.abs(total - 100) > 0.01) {
      const remainder = Math.max(0, 100 - total);
      console.log('  Creating an extra goal to fill remainder weightage=', remainder);
      const extraRes = await axios.post(`${API}/goals`, {
        thrustArea: 'OTHER',
        title: 'Filler goal for weightage',
        description: 'Auto-created to satisfy weightage rule',
        unitOfMeasurement: 'NUMERIC',
        target: 1,
        weightage: remainder,
        cycleId: cycle.id
      }, { headers: { Authorization: `Bearer ${empToken}` } });
      console.log('  created filler goal id=', extraRes.data.goal.id);
    }

    // Refresh draft goals and submit all draft goal ids
    const draftGoalsRes = await axios.get(`${API}/goals/employee/me?cycleId=${cycle.id}`, { headers: { Authorization: `Bearer ${empToken}` } });
    const draftGoals = draftGoalsRes.data.filter(g => g.status === 'DRAFT');
    const draftIds = draftGoals.map(g => g.id);
    console.log('  submitting goal ids:', draftIds);
    const submitRes = await axios.post(`${API}/goals/submit`, { goalIds: draftIds, cycleId: cycle.id }, { headers: { Authorization: `Bearer ${empToken}` } });
    console.log('  submit response:', submitRes.data.message);

    // small pause for DB consistency
    await pause(500);

    console.log('5) Login as manager');
    const mgrLogin = await axios.post(`${API}/auth/login`, { email: 'manager@company.com', password: 'password123' });
    const mgrToken = mgrLogin.data.token;

    console.log('6) Fetch submitted team goals');
    const teamRes = await axios.get(`${API}/goals/team?status=SUBMITTED`, { headers: { Authorization: `Bearer ${mgrToken}` } });
    const submitted = teamRes.data.find(g => g.id === createdGoal.id);
    if (!submitted) throw new Error('Submitted goal not visible to manager');
    console.log('  manager sees submitted goal');

    console.log('7) Approve the goal');
    const approveRes = await axios.post(`${API}/goals/${createdGoal.id}/approve`, { approved: true }, { headers: { Authorization: `Bearer ${mgrToken}` } });
    console.log('  approve response:', approveRes.data.message);

    await pause(500);

    console.log('8) Employee creates a check-in for the approved goal');
    const checkInRes = await axios.post(`${API}/check-ins`, {
      goalId: createdGoal.id,
      cycleId: cycle.id,
      actualAchievement: 50,
      status: 'ON_TRACK',
      comment: 'Progressing'
    }, { headers: { Authorization: `Bearer ${empToken}` } });
    console.log('  check-in created id=', checkInRes.data.checkIn.id);
    const checkInId = checkInRes.data.checkIn.id;

    console.log('9) Manager adds a comment to check-in');
    const commentRes = await axios.put(`${API}/check-ins/${checkInId}/comment`, { managerComment: 'Good progress' }, { headers: { Authorization: `Bearer ${mgrToken}` } });
    console.log('  comment response:', commentRes.data.message);

    console.log('10) Manager gets team check-in status');
    const statusRes = await axios.get(`${API}/check-ins/team/status?cycleId=${cycle.id}`, { headers: { Authorization: `Bearer ${mgrToken}` } });
    console.log('  team status:', JSON.stringify(statusRes.data, null, 2));

    console.log('E2E flow completed successfully');
  } catch (err) {
    console.error('E2E flow failed:', err.response?.data || err.message);
    process.exit(1);
  }
};

run();
