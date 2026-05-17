const express = require('express');
const cycleController = require('../controllers/cycleController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('ADMIN'), cycleController.createCycle);
router.get('/active', cycleController.getActiveCycle); // Put specific route BEFORE :cycleId
router.get('/', cycleController.getCycles);
router.put('/:cycleId', roleMiddleware('ADMIN'), cycleController.updateCycle);

module.exports = router;
