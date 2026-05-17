const express = require('express');
const auditLogController = require('../controllers/auditLogController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/', auditLogController.listAuditLogs);

module.exports = router;