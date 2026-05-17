const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cycle = sequelize.define('Cycle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phase: {
      type: DataTypes.ENUM('GOAL_SETTING', 'Q1', 'Q2', 'Q3', 'Q4_ANNUAL'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    goalSubmissionDeadline: DataTypes.DATE,
    approvalDeadline: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'cycles'
  });

  return Cycle;
};
