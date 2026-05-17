#!/usr/bin/env node

require('dotenv').config();
const db = require('../models');
const seedDatabase = require('./demo-data');

const runSeeds = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    await db.sequelize.sync();
    console.log('✅ Models synchronized');

    await seedDatabase();
    console.log('✅ Seeding completed');

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeds();
