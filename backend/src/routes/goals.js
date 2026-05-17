const express = require('express');
const goalController = require('../controllers/goalController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Employee routes
router.post('/', goalController.createGoal);
router.get('/employee/me', goalController.getGoalsByEmployee); // Specific /me route first
router.get('/employee/:employeeId', goalController.getGoalsByEmployee);
router.post('/submit', goalController.submitGoals);

// Manager routes
router.post('/:goalId/approve', roleMiddleware('MANAGER', 'ADMIN'), goalController.approveGoal);
router.get('/team', roleMiddleware('MANAGER', 'ADMIN'), goalController.getTeamGoals);

module.exports = router;
