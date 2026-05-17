require('dotenv').config();
const db = require('./src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Using database:', db.sequelize.options.storage || db.sequelize.config.database);
    
    await db.sequelize.sync({ force: true });
    console.log('Database synced (reset)');

    const users = [
      {
        email: 'employee@company.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Employee',
        role: 'EMPLOYEE'
      },
      {
        email: 'manager@company.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Manager',
        role: 'MANAGER'
      },
      {
        email: 'admin@company.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    ];

    let employeeUser;
    let managerUser;
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const createdUser = await db.User.create({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      console.log('Created user:', userData.email);
      if (userData.role === 'EMPLOYEE') employeeUser = createdUser;
      if (userData.role === 'MANAGER') managerUser = createdUser;
    }

    const startDate = new Date(2026, 3, 1);
    const endDate = new Date(2026, 5, 30);
    const cycle = await db.Cycle.create({
      name: 'Q2 2026',
      description: 'Second quarter of 2026',
      startDate,
      endDate,
      status: 'ACTIVE',
      year: 2026,
      phase: 'Q2'
    });
    console.log('Created cycle: Q2 2026');

    if (employeeUser && cycle) {
      await db.Goal.create({
        employeeId: employeeUser.id,
        cycleId: cycle.id,
        thrustArea: 'SALES',
        title: 'Increase Sales by 20%',
        description: 'Achieve 5M quarterly revenue',
        unitOfMeasurement: 'PERCENTAGE',
        target: 20,
        weightage: 40,
        status: 'DRAFT'
      });
      console.log('Created goal for employee');
    }

    // Link employee to manager for demo dashboards
    if (employeeUser && managerUser) {
      await employeeUser.update({ reportingManagerId: managerUser.id });
      console.log(`Assigned ${employeeUser.email} to manager ${managerUser.email}`);
    }

    console.log('Database seeding completed');
    
    const allUsers = await db.User.findAll();
    console.log('Verified users in database:', allUsers.length);
    const allCycles = await db.Cycle.findAll();
    console.log('Verified cycles in database:', allCycles.length);
    const allGoals = await db.Goal.findAll();
    console.log('Verified goals in database:', allGoals.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
