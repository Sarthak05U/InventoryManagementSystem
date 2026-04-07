const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'Admin' : role || 'Staff',
      approved: isFirstUser,
    });

    if (isFirstUser) {
      const token = generateToken(user._id);
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        token,
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      message: 'Account created. Waiting for admin approval.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.approved) {
      return res
        .status(403)
        .json({ message: 'Account not yet approved by an admin' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    approved: req.user.approved,
  });
};

// @desc    Approve a user (Admin only)
// @route   PATCH /api/auth/approve/:id
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approved = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending users (Admin only)
// @route   GET /api/auth/pending
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe, approveUser, getPendingUsers, getAllUsers };
