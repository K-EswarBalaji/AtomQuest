const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    storage: dbConfig.storage
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.User = require('./User')(sequelize);
db.Cycle = require('./Cycle')(sequelize);
db.Goal = require('./Goal')(sequelize);
db.CheckIn = require('./CheckIn')(sequelize);
db.AuditLog = require('./AuditLog')(sequelize);

// Define associations
db.User.hasMany(db.Goal, { foreignKey: 'employeeId', as: 'goals' });
db.Goal.belongsTo(db.User, { foreignKey: 'employeeId', as: 'employee' });

db.User.hasMany(db.CheckIn, { foreignKey: 'managerId' });
db.CheckIn.belongsTo(db.User, { foreignKey: 'managerId', as: 'manager' });

db.Cycle.hasMany(db.Goal, { foreignKey: 'cycleId' });
db.Goal.belongsTo(db.Cycle, { foreignKey: 'cycleId', as: 'cycle' });

db.Goal.hasMany(db.CheckIn, { foreignKey: 'goalId' });
db.CheckIn.belongsTo(db.Goal, { foreignKey: 'goalId' });

db.User.hasMany(db.AuditLog, { foreignKey: 'userId' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'userId' });

// Reporting manager relationship
db.User.hasMany(db.User, { foreignKey: 'reportingManagerId', as: 'directReports' });
db.User.belongsTo(db.User, { foreignKey: 'reportingManagerId', as: 'reportingManager' });

module.exports = db;
