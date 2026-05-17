const db = require('../models');

const auditLogController = {
  listAuditLogs: async (req, res) => {
    try {
      const logs = await db.AuditLog.findAll({
        include: [
          {
            model: db.User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
    }
  }
};

module.exports = auditLogController;