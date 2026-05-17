const db = require('../models');
const { calculateProgressScore, getProgressStatus } = require('../utils/validation');
const { generateAuditLog } = require('../utils/auth');

const checkInController = {
  createCheckIn: async (req, res) => {
    try {
      const { goalId, cycleId, actualAchievement, completionDate, status, comment } = req.body;

      const goal = await db.Goal.findByPk(goalId);
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      // Calculate progress score
      const progressScore = calculateProgressScore(
        actualAchievement,
        goal.target,
        goal.unitOfMeasurement
      );
      const progressStatus = getProgressStatus(progressScore);

      const checkIn = await db.CheckIn.create({
        goalId,
        cycleId,
        actualAchievement,
        status: status || progressStatus,
        completionDate,
        comment,
        checkInDate: new Date()
      });

      // Update goal with actual achievement
      await goal.update({
        actual: actualAchievement,
        progressScore,
        progressStatus
      });

      // Log
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        'CREATE_CHECKIN',
        'CheckIn',
        checkIn.id,
        null,
        checkIn.toJSON()
      ));

      res.status(201).json({
        message: 'Check-in created successfully',
        checkIn: {
          ...checkIn.toJSON(),
          progressScore,
          progressStatus
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create check-in', error: error.message });
    }
  },

  getCheckIns: async (req, res) => {
    try {
      const { goalId, cycleId } = req.query;

      const whereClause = {};
      if (goalId) whereClause.goalId = goalId;
      if (cycleId) whereClause.cycleId = cycleId;

      const checkIns = await db.CheckIn.findAll({
        where: whereClause,
        include: [
          { model: db.Goal },
          { model: db.User, as: 'manager', attributes: ['firstName', 'lastName'] }
        ]
      });

      res.status(200).json(checkIns);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch check-ins', error: error.message });
    }
  },

  addManagerComment: async (req, res) => {
    try {
      const { checkInId } = req.params;
      const { managerComment } = req.body;

      const checkIn = await db.CheckIn.findByPk(checkInId);
      if (!checkIn) {
        return res.status(404).json({ message: 'Check-in not found' });
      }

      const oldValues = checkIn.toJSON();

      await checkIn.update({
        managerComment,
        managerId: req.user.id
      });

      // Log
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        'ADD_COMMENT',
        'CheckIn',
        checkInId,
        oldValues,
        checkIn.toJSON()
      ));

      res.status(200).json({
        message: 'Comment added successfully',
        checkIn
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
  },

  getTeamCheckInStatus: async (req, res) => {
    try {
      const { cycleId } = req.query;

      // Get all direct reports
      const directReports = await db.User.findAll({
        where: { reportingManagerId: req.user.id },
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      const directReportIds = directReports.map(u => u.id);

      // If no direct reports, return empty array
      if (!directReportIds.length) {
        return res.status(200).json([]);
      }

      // Fetch all goals for direct reports in this cycle in one query
      const goals = await db.Goal.findAll({
        where: { employeeId: directReportIds, cycleId },
        attributes: ['id', 'employeeId']
      });

      const goalIds = goals.map(g => g.id);

      // Map goalId -> employeeId for quick lookup
      const goalToEmployee = {};
      goals.forEach(g => { goalToEmployee[g.id] = g.employeeId; });

      // Fetch check-ins only for those goals and the cycle
      const checkIns = goalIds.length ? await db.CheckIn.findAll({
        where: { goalId: goalIds, cycleId },
        attributes: ['id', 'goalId', 'managerComment']
      }) : [];

      // Count completed (managerComment present) check-ins per employee
      const completedByEmployee = {};
      checkIns.forEach(ci => {
        if (ci.managerComment) {
          const empId = goalToEmployee[ci.goalId];
          if (empId) completedByEmployee[empId] = (completedByEmployee[empId] || 0) + 1;
        }
      });

      // Group goal counts per employee
      const goalsByEmployee = {};
      goals.forEach(g => { goalsByEmployee[g.employeeId] = (goalsByEmployee[g.employeeId] || 0) + 1; });

      const statusData = directReports.map(employee => {
        const total = goalsByEmployee[employee.id] || 0;
        const completed = completedByEmployee[employee.id] || 0;

        return {
          employee: {
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email
          },
          totalGoals: total,
          checkInsCompleted: completed,
          completionPercentage: total ? (completed / total * 100).toFixed(2) : '0.00'
        };
      });

      res.status(200).json(statusData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch check-in status', error: error.message });
    }
  }
};

module.exports = checkInController;
