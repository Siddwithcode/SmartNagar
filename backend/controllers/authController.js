const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const cookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
});

const setTokenCookie = (res, token, rememberMe = false) => {
  res.cookie('token', token, cookieOptions(rememberMe));
};

const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
};

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  civicPoints: user.civicPoints,
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const allowedRoles = ['Citizen', 'Admin'];
    const userRole = allowedRoles.includes(role) ? role : 'Citizen';

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json(formatUser(user));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token, Boolean(rememberMe));

    res.status(200).json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(formatUser(req.user));
};

const logout = async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };
