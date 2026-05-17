const db = require('../models');
const { validateGoalWeightage, validateGoalCount, calculateProgressScore, getProgressStatus } = require('../utils/validation');
const { generateAuditLog } = require('../utils/auth');

const goalController = {
  createGoal: async (req, res) => {
    try {
      const { thrustArea, title, description, unitOfMeasurement, target, weightage, cycleId } = req.body;

      const goal = await db.Goal.create({
        employeeId: req.user.id,
        cycleId,
        thrustArea,
        title,
        description,
        unitOfMeasurement,
        target,
        weightage,
        status: 'DRAFT'
      });

      // Log the action
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        'CREATE',
        'Goal',
        goal.id,
        null,
        goal.toJSON()
      ));

      res.status(201).json({
        message: 'Goal created successfully',
        goal
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create goal', error: error.message });
    }
  },

  getGoalsByEmployee: async (req, res) => {
    try {
      const { cycleId } = req.query;
      const employeeId = req.params.employeeId || req.user.id;

      const whereClause = { employeeId };
      if (cycleId) whereClause.cycleId = cycleId;

      const goals = await db.Goal.findAll({
        where: whereClause,
        include: [
          { model: db.Cycle, as: 'cycle' },
          { model: db.User, as: 'employee', attributes: ['firstName', 'lastName', 'email'] }
        ]
      });

      res.status(200).json(goals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch goals', error: error.message });
    }
  },

  submitGoals: async (req, res) => {
    try {
      const { goalIds, cycleId } = req.body;

      const goals = await db.Goal.findAll({
        where: { id: goalIds, employeeId: req.user.id }
      });

      // Validate
      const validation = validateGoalCount(goals);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const weightageValidation = validateGoalWeightage(goals);
      if (!weightageValidation.valid) {
        return res.status(400).json({ message: weightageValidation.message });
      }

      // Update status
      await db.Goal.update(
        { status: 'SUBMITTED' },
        { where: { id: goalIds } }
      );

      // Log
      for (const goalId of goalIds) {
        await db.AuditLog.create(generateAuditLog(
          req.user.id,
          'SUBMIT',
          'Goal',
          goalId,
          { status: 'DRAFT' },
          { status: 'SUBMITTED' }
        ));
      }

      res.status(200).json({
        message: 'Goals submitted successfully for approval'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit goals', error: error.message });
    }
  },

  approveGoal: async (req, res) => {
    try {
      const { goalId } = req.params;
      const { approved, rejectionReason, targetAdjustment } = req.body;

      const goal = await db.Goal.findByPk(goalId);
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      // Authorization: Only manager or admin
      if (req.user.role !== 'MANAGER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Only managers can approve goals' });
      }

      const oldValues = goal.toJSON();

      if (approved) {
        await goal.update({
          status: 'APPROVED',
          approvedBy: req.user.id,
          approvalDate: new Date(),
          target: targetAdjustment || goal.target,
          lockedDate: new Date()
        });
      } else {
        await goal.update({
          status: 'REJECTED',
          rejectionReason
        });
      }

      // Log
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        approved ? 'APPROVE' : 'REJECT',
        'Goal',
        goalId,
        oldValues,
        goal.toJSON(),
        rejectionReason || null
      ));

      res.status(200).json({
        message: `Goal ${approved ? 'approved' : 'rejected'} successfully`,
        goal
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update goal', error: error.message });
    }
  },

  getTeamGoals: async (req, res) => {
    try {
      const { cycleId, status } = req.query;

      let whereClause = {};
      if (cycleId) whereClause.cycleId = cycleId;
      if (status) whereClause.status = status;

      // If user is ADMIN, show all goals. If MANAGER, show only direct reports' goals
      if (req.user.role === 'ADMIN') {
        // Admin sees all goals
      } else if (req.user.role === 'MANAGER') {
        // Manager sees only their direct reports' goals
        const directReports = await db.User.findAll({
          where: { reportingManagerId: req.user.id },
          attributes: ['id']
        });
        const directReportIds = directReports.map(u => u.id);
        whereClause.employeeId = directReportIds;
      } else {
        // Non-manager/admin cannot access this endpoint
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const goals = await db.Goal.findAll({
        where: whereClause,
        include: [
          { model: db.User, as: 'employee', attributes: ['firstName', 'lastName', 'email'] },
          { model: db.Cycle, as: 'cycle' }
        ]
      });

      res.status(200).json(goals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch team goals', error: error.message });
    }
  }
};

module.exports = goalController;
