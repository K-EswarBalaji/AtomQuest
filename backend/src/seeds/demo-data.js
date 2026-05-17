const { hashPassword } = require('../utils/auth');
const db = require('../models');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await db.sequelize.truncate({ cascade: true });

    // Create demo users
    const hashedPassword = await hashPassword('password123');

    const employees = await db.User.bulkCreate([
      {
        email: 'employee@company.com',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        role: 'EMPLOYEE',
        department: 'Sales',
        isActive: true
      },
      {
        email: 'employee2@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        role: 'EMPLOYEE',
        department: 'Operations',
        isActive: true
      }
    ]);

    const manager = await db.User.create({
      email: 'manager@company.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Sales',
      isActive: true
    });

    const admin = await db.User.create({
      email: 'admin@company.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      password: hashedPassword,
      role: 'ADMIN',
      department: 'HR',
      isActive: true
    });

    // Update reporting relationships
    await employees[0].update({ reportingManagerId: manager.id });
    await employees[1].update({ reportingManagerId: manager.id });

    // Create cycles
    const cycle = await db.Cycle.create({
      name: 'FY2024-25 Q1',
      year: 2024,
      phase: 'GOAL_SETTING',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-06-30'),
      goalSubmissionDeadline: new Date('2024-05-31'),
      approvalDeadline: new Date('2024-06-15'),
      isActive: true
    });

    // Create sample goals
    await db.Goal.bulkCreate([
      {
        employeeId: employees[0].id,
        cycleId: cycle.id,
        thrustArea: 'SALES',
        title: 'Increase Sales Revenue',
        description: 'Achieve 20% increase in quarterly sales revenue',
        unitOfMeasurement: 'PERCENTAGE',
        target: 120,
        weightage: 40,
        status: 'APPROVED',
        lockedDate: new Date(),
        approvedBy: manager.id,
        approvalDate: new Date()
      },
      {
        employeeId: employees[0].id,
        cycleId: cycle.id,
        thrustArea: 'TEAM',
        title: 'Team Training & Development',
        description: 'Complete advanced sales training program',
        unitOfMeasurement: 'ZERO_BASED',
        target: 0,
        weightage: 30,
        status: 'APPROVED',
        lockedDate: new Date(),
        approvedBy: manager.id,
        approvalDate: new Date()
      },
      {
        employeeId: employees[0].id,
        cycleId: cycle.id,
        thrustArea: 'CUSTOMER',
        title: 'Customer Satisfaction Score',
        description: 'Achieve 95% customer satisfaction rating',
        unitOfMeasurement: 'PERCENTAGE',
        target: 95,
        weightage: 30,
        status: 'APPROVED',
        lockedDate: new Date(),
        approvedBy: manager.id,
        approvalDate: new Date()
      }
    ]);

    console.log('✅ Database seeded successfully');
    console.log('\nDemo Credentials:');
    console.log('Employee: employee@company.com / password123');
    console.log('Manager: manager@company.com / password123');
    console.log('Admin: admin@company.com / password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
