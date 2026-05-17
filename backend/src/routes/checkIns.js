const express = require('express');
const checkInController = require('../controllers/checkInController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkInController.createCheckIn);
router.get('/', checkInController.getCheckIns);
router.put('/:checkInId/comment', roleMiddleware('MANAGER', 'ADMIN'), checkInController.addManagerComment);
router.get('/team/status', roleMiddleware('MANAGER', 'ADMIN'), checkInController.getTeamCheckInStatus);

module.exports = router;
