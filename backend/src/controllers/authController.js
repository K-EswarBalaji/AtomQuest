const db = require('../models');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');

const authController = {
  register: async (req, res) => {
    try {
      const { email, firstName, lastName, password, department, role } = req.body;

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await db.User.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        department,
        role: role || 'EMPLOYEE'
      });

      const token = generateToken(user);
      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      await user.update({ lastLogin: new Date() });

      const token = generateToken(user);
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const user = await db.User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone, avatar } = req.body;

      const user = await db.User.findByPk(req.user.id);
      await user.update({ firstName, lastName, phone, avatar });

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
  }
};

module.exports = authController;
