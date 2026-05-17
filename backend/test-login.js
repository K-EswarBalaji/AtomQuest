require('dotenv').config();
const db = require('./src/models');

const testLogin = async () => {
  try {
    console.log('🔧 Using database:', db.sequelize.options.storage || db.sequelize.config.database);
    
    // Ensure database connection is available (avoid altering schema)
    await db.sequelize.authenticate();
    console.log('✅ Database connection OK');
    
    // Check if Users table exists
    const users = await db.User.findAll();
    console.log('📊 Total users in database:', users.length);
    if (users.length > 0) {
      console.log('Users:', users.map(u => u.email));
    }
    
    const user = await db.User.findOne({ where: { email: 'employee@company.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      password: user.password
    });

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare('password123', user.password);
    console.log('Password valid:', isValid);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

testLogin();
