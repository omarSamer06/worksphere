const User = require('../models/userModel');

const populateUser = (query) =>
  query
    .select('-password')
    .populate('manager', 'name email')
    .populate('department', 'name description')
    .populate('position', 'title');

const formatUser = (u) => ({
  ...u,
  remainingLeave: u.totalLeave - u.usedLeave,
});

// @desc    Get current authenticated user profile
// @route   GET /api/v1/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await populateUser(User.findById(req.user._id)).lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update own profile (phone, address, hireDate)
// @route   PUT /api/v1/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { phone, address, hireDate } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (hireDate !== undefined) user.hireDate = hireDate || null;

    await user.save();
    await user.populate([
      { path: 'manager', select: 'name email' },
      { path: 'department', select: 'name description' },
      { path: 'position', select: 'title' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUser(user.toObject()),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/v1/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, manager, totalLeave, department, position, phone, address, hireDate } = req.body;

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

    const user = await User.create({
      name, email, password, role, manager,
      totalLeave, department, position, phone, address, hireDate,
    });

    await user.populate([
      { path: 'manager', select: 'name email' },
      { path: 'department', select: 'name description' },
      { path: 'position', select: 'title' },
    ]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: formatUser(user.toObject()),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await populateUser(User.find()).lean();

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users.map(formatUser),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await populateUser(User.findById(req.params.id)).lean();

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/v1/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, manager, totalLeave, department, position, phone, address, hireDate } = req.body;

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
    if (department !== undefined) user.department = department || null;
    if (position !== undefined) user.position = position || null;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (hireDate !== undefined) user.hireDate = hireDate || null;

    await user.save();
    await user.populate([
      { path: 'manager', select: 'name email' },
      { path: 'department', select: 'name description' },
      { path: 'position', select: 'title' },
    ]);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: formatUser(user.toObject()),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (admin only)
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

module.exports = { getMe, updateProfile, createUser, getAllUsers, getUserById, updateUser, deleteUser };
