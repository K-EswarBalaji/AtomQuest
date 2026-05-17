const db = require('../models');
const { hashPassword } = require('../utils/auth');

const userController = {
  listUsers: async (req, res) => {
    try {
      const users = await db.User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
        department,
        role,
        reportingManagerId,
        isActive = true,
        phone,
        avatar
      } = req.body;

      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: 'Email, first name and last name are required' });
      }

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const user = await db.User.create({
        email,
        firstName,
        lastName,
        password: password ? await hashPassword(password) : null,
        department,
        role: role || 'EMPLOYEE',
        reportingManagerId: reportingManagerId || null,
        isActive,
        phone,
        avatar
      });

      const createdUser = await db.User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });

      res.status(201).json({ message: 'User created successfully', user: createdUser });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        email,
        firstName,
        lastName,
        password,
        department,
        role,
        reportingManagerId,
        isActive,
        phone,
        avatar
      } = req.body;

      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (email && email !== user.email) {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser && existingUser.id !== user.id) {
          return res.status(409).json({ message: 'Email already registered' });
        }
      }

      await user.update({
        email: email ?? user.email,
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        password: password ? await hashPassword(password) : user.password,
        department: department ?? user.department,
        role: role ?? user.role,
        reportingManagerId: reportingManagerId ?? user.reportingManagerId,
        isActive: typeof isActive === 'boolean' ? isActive : user.isActive,
        phone: phone ?? user.phone,
        avatar: avatar ?? user.avatar
      });

      const updatedUser = await db.User.findByPk(user.id, {
        attributes: { exclude: ['password'] }
      });

      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.destroy();

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  }
};

module.exports = userController;