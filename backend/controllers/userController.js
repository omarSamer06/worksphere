const User = require('../models/userModel');

// @desc    Create a new user (admin only)
// @route   POST /api/v1/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.statusCode = 400;
      return next(error);
    }

    const exists = await User.findOne({ email });
    if (exists) {
      const error = new Error('A user with this email already exists');
      error.statusCode = 409;
      return next(error);
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
