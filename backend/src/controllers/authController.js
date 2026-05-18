const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = require('../models');
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

      console.log('LOGIN ATTEMPT:', email);

      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        console.log('USER NOT FOUND');
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      console.log('USER FOUND');

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      console.log('PASSWORD MATCH:', isMatch);

      if (!isMatch) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        {
          expiresIn: '7d'
        }
      );

      res.json({
        token,
        user
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Server error'
      });
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
