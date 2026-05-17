const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateAuditLog = (userId, action, entityType, entityId, oldValues, newValues, reason) => {
  return {
    userId,
    action,
    entityType,
    entityId,
    oldValues: oldValues || {},
    newValues: newValues || {},
    reason: reason || null
  };
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  generateAuditLog
};
