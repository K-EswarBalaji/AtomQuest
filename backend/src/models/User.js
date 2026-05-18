const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // NULL for SSO users
    },
    phone: DataTypes.STRING,
    avatar: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('EMPLOYEE', 'MANAGER', 'ADMIN'),
      defaultValue: 'EMPLOYEE'
    },
    department: DataTypes.STRING,
    reportingManagerId: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: DataTypes.DATE,
    ssoProvider: DataTypes.STRING, // 'AZURE_AD', 'GOOGLE', etc.
    ssoId: DataTypes.STRING
  }, {
    timestamps: true,
    tableName: 'users'
  });

  return User;
};
