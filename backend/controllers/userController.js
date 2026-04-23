const User = require('../models/userModel');

// @desc    Get current authenticated user profile
// @route   GET /api/v1/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('manager', 'name email')
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        ...user,
        remainingLeave: user.totalLeave - user.usedLeave,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/v1/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, manager, totalLeave } = req.body;

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

    const user = await User.create({ name, email, password, role, manager, totalLeave });
    await user.populate('manager', 'name email');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalLeave: user.totalLeave,
        usedLeave: user.usedLeave,
        remainingLeave: user.totalLeave - user.usedLeave,
        manager: user.manager,
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
    const users = await User.find()
      .select('-password')
      .populate('manager', 'name email')
      .lean();

    const result = users.map((u) => ({
      ...u,
      remainingLeave: u.totalLeave - u.usedLeave,
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'name email')
      .lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { ...user, remainingLeave: user.totalLeave - user.usedLeave },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, manager, totalLeave } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (manager !== undefined) user.manager = manager || null;
    if (totalLeave !== undefined) user.totalLeave = totalLeave;

    await user.save();
    await user.populate('manager', 'name email');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalLeave: user.totalLeave,
        usedLeave: user.usedLeave,
        remainingLeave: user.totalLeave - user.usedLeave,
        manager: user.manager,
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

module.exports = { getMe, createUser, getAllUsers, getUserById, updateUser, deleteUser };
