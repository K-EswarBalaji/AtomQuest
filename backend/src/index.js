require('dotenv').config();
const db = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Ensure database is connected and schema is synced before starting the server
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database schema synchronized (alter:true)');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Database connection or sync failed:', error);
    process.exit(1);
  });

module.exports = app;
