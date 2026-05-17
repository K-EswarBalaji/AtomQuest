/**
 * Integration test for GET /api/check-ins/team/status
 */
process.env.NODE_ENV = 'development';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'testsecret';
process.env.PORT = '0';

const request = require('supertest');
const db = require('../src/models');
const app = require('../src/index');
const { generateToken } = require('../src/utils/auth');

jest.setTimeout(20000);

describe('GET /api/check-ins/team/status', () => {
  beforeAll(async () => {
    // Ensure fresh in-memory DB
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('returns per-employee goal and check-in completion counts for manager', async () => {
    // Create manager and employee
    const manager = await db.User.create({
      email: 'mgr@test.com',
      password: 'x',
      firstName: 'Manager',
      lastName: 'One',
      role: 'MANAGER'
    });

    const employee = await db.User.create({
      email: 'emp@test.com',
      password: 'x',
      firstName: 'Employee',
      lastName: 'One',
      role: 'EMPLOYEE',
      reportingManagerId: manager.id
    });

    // Create cycle
    const cycle = await db.Cycle.create({
      name: 'Test Cycle',
      description: 'Test',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: 'ACTIVE',
      year: 2026,
      phase: 'T1'
    });

    // Create two goals for the employee
    const g1 = await db.Goal.create({
      employeeId: employee.id,
      cycleId: cycle.id,
      thrustArea: 'TEAM',
      title: 'Goal 1',
      unitOfMeasurement: 'NUMERIC',
      target: 10,
      weightage: 50,
      status: 'APPROVED'
    });

    const g2 = await db.Goal.create({
      employeeId: employee.id,
      cycleId: cycle.id,
      thrustArea: 'TEAM',
      title: 'Goal 2',
      unitOfMeasurement: 'NUMERIC',
      target: 20,
      weightage: 50,
      status: 'APPROVED'
    });

    // Create a check-in with manager comment for g1
    await db.CheckIn.create({
      goalId: g1.id,
      cycleId: cycle.id,
      actualAchievement: 5,
      status: 'COMPLETED',
      comment: 'done',
      managerComment: 'Good work',
      checkInDate: new Date()
    });

    const token = generateToken(manager);

    const res = await request(app)
      .get(`/api/check-ins/team/status?cycleId=${cycle.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const entry = res.body.find(e => e.employee && e.employee.email === 'emp@test.com');
    expect(entry).toBeDefined();
    expect(entry.totalGoals).toBe(2);
    expect(entry.checkInsCompleted).toBe(1);
    expect(Number(entry.completionPercentage)).toBeCloseTo(50.0, 2);
  });
});
