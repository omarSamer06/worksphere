const Position = require('../models/positionModel');

// @desc    Create position
// @route   POST /api/v1/positions
const createPosition = async (req, res, next) => {
  try {
    const { title, department, manager } = req.body;

    if (!title) {
      const error = new Error('Position title is required');
      error.statusCode = 400;
      return next(error);
    }

    const position = await Position.create({ title, department: department || null, manager: manager || null });
    await position.populate([
      { path: 'department', select: 'name' },
      { path: 'manager', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: position,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all positions
// @route   GET /api/v1/positions
const getPositions = async (req, res, next) => {
  try {
    const positions = await Position.find()
      .populate('department', 'name')
      .populate('manager', 'name email')
      .sort({ title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Positions retrieved successfully',
      data: positions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update position
// @route   PUT /api/v1/positions/:id
const updatePosition = async (req, res, next) => {
  try {
    const { title, department, manager } = req.body;

    const position = await Position.findById(req.params.id);
    if (!position) {
      const error = new Error('Position not found');
      error.statusCode = 404;
      return next(error);
    }

    if (title !== undefined) position.title = title;
    if (department !== undefined) position.department = department || null;
    if (manager !== undefined) position.manager = manager || null;

    await position.save();
    await position.populate([
      { path: 'department', select: 'name' },
      { path: 'manager', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Position updated successfully',
      data: position,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete position
// @route   DELETE /api/v1/positions/:id
const deletePosition = async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      const error = new Error('Position not found');
      error.statusCode = 404;
      return next(error);
    }

    await position.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Position deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPosition, getPositions, updatePosition, deletePosition };
