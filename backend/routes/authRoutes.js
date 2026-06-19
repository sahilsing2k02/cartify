const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Helper function to generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const role = 'employee';

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role
    });

    if (user) {
      // Create session activity log record on registration since they log in immediately
      const session = await Session.create({
        user: user._id,
        username: user.username,
        loginTime: new Date()
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
        sessionId: session._id // Send sessionId to frontend to track exit time
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been blocked by an administrator.' });
    }

    if (await bcrypt.compare(password, user.password)) {
      // Create session activity log record in MongoDB
      const session = await Session.create({
        user: user._id,
        username: user.username,
        loginTime: new Date()
      });

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
        sessionId: session._id // Send sessionId to frontend to track exit time
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Log exit time for user session
// @access  Public
router.post('/logout', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }
  try {
    await Session.findByIdAndUpdate(sessionId, { logoutTime: new Date() });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout log error:', error);
    res.status(500).json({ message: 'Server error logging logout time' });
  }
});

// @route   GET /api/auth/sessions
// @desc    Get all login sessions consolidated per user
// @access  Private/Admin
router.get('/sessions', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).sort({ username: 1 });
    
    const userSessions = await Promise.all(
      users.map(async (u) => {
        const latestSession = await Session.findOne({ user: u._id }).sort({ loginTime: -1 });
        return {
          _id: u._id,
          username: u.username,
          role: u.role,
          isBlocked: u.isBlocked,
          loginTime: latestSession ? latestSession.loginTime : null,
          logoutTime: latestSession ? latestSession.logoutTime : null,
          sessionId: latestSession ? latestSession._id : null
        };
      })
    );
    
    res.json(userSessions);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for logged-in user
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// @route   PUT /api/auth/users/:id/block
// @desc    Block a user
// @access  Private/Admin
router.put('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin user' });
    }
    user.isBlocked = true;
    await user.save();
    res.json({ message: `User ${user.username} blocked successfully`, user });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error blocking user' });
  }
});

// @route   PUT /api/auth/users/:id/unblock
// @desc    Unblock a user
// @access  Private/Admin
router.put('/users/:id/unblock', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBlocked = false;
    await user.save();
    res.json({ message: `User ${user.username} unblocked successfully`, user });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error unblocking user' });
  }
});

module.exports = router;
