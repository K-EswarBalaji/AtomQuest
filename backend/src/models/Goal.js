const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Goal = sequelize.define('Goal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    cycleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'cycles', key: 'id' }
    },
    thrustArea: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    unitOfMeasurement: {
      type: DataTypes.ENUM('NUMERIC', 'PERCENTAGE', 'TIMELINE', 'ZERO_BASED'),
      allowNull: false
    },
    target: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    actual: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null
    },
    weightage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'LOCKED'),
      defaultValue: 'DRAFT'
    },
    progressStatus: {
      type: DataTypes.ENUM('NOT_STARTED', 'ON_TRACK', 'COMPLETED', 'AT_RISK'),
      defaultValue: 'NOT_STARTED'
    },
    progressScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: null
    },
    isSharedGoal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    primaryOwnerId: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    },
    approvalDate: DataTypes.DATE,
    rejectionReason: DataTypes.TEXT,
    lockedDate: DataTypes.DATE
  }, {
    timestamps: true,
    tableName: 'goals'
  });

  return Goal;
};
