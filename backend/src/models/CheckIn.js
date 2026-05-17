const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CheckIn = sequelize.define('CheckIn', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    goalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Goals', key: 'id' }
    },
    cycleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Cycles', key: 'id' }
    },
    managerId: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' }
    },
    actualAchievement: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('NOT_STARTED', 'ON_TRACK', 'COMPLETED', 'AT_RISK'),
      defaultValue: 'ON_TRACK'
    },
    completionDate: DataTypes.DATE,
    comment: DataTypes.TEXT,
    managerComment: DataTypes.TEXT,
    checkInDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' }
    }
  }, {
    timestamps: true,
    tableName: 'check_ins'
  });

  return CheckIn;
};
