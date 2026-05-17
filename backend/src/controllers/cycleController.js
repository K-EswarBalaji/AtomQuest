const db = require('../models');
const { generateAuditLog } = require('../utils/auth');

const cycleController = {
  createCycle: async (req, res) => {
    try {
      const { name, year, phase, startDate, endDate, goalSubmissionDeadline, approvalDeadline } = req.body;

      const cycle = await db.Cycle.create({
        name,
        year,
        phase,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goalSubmissionDeadline: goalSubmissionDeadline ? new Date(goalSubmissionDeadline) : null,
        approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : null,
        isActive: false
      });

      // Log
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        'CREATE',
        'Cycle',
        cycle.id,
        null,
        cycle.toJSON()
      ));

      res.status(201).json({
        message: 'Cycle created successfully',
        cycle
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create cycle', error: error.message });
    }
  },

  getCycles: async (req, res) => {
    try {
      const cycles = await db.Cycle.findAll({
        order: [['startDate', 'DESC']]
      });

      res.status(200).json(cycles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cycles', error: error.message });
    }
  },

  getActiveCycle: async (req, res) => {
    try {
      const now = new Date();
      const cycle = await db.Cycle.findOne({
        where: {
          startDate: { [db.Sequelize.Op.lte]: now },
          endDate: { [db.Sequelize.Op.gte]: now }
        }
      });

      if (!cycle) {
        return res.status(404).json({ message: 'No active cycle found' });
      }

      res.status(200).json(cycle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch active cycle', error: error.message });
    }
  },

  updateCycle: async (req, res) => {
    try {
      const { cycleId } = req.params;
      const { isActive, goalSubmissionDeadline, approvalDeadline } = req.body;

      const cycle = await db.Cycle.findByPk(cycleId);
      if (!cycle) {
        return res.status(404).json({ message: 'Cycle not found' });
      }

      const oldValues = cycle.toJSON();

      await cycle.update({
        isActive: isActive !== undefined ? isActive : cycle.isActive,
        goalSubmissionDeadline: goalSubmissionDeadline ? new Date(goalSubmissionDeadline) : cycle.goalSubmissionDeadline,
        approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : cycle.approvalDeadline
      });

      // Log
      await db.AuditLog.create(generateAuditLog(
        req.user.id,
        'UPDATE',
        'Cycle',
        cycleId,
        oldValues,
        cycle.toJSON()
      ));

      res.status(200).json({
        message: 'Cycle updated successfully',
        cycle
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update cycle', error: error.message });
    }
  }
};

module.exports = cycleController;
