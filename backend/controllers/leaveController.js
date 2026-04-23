const Leave = require('../models/leaveModel');

// @desc    Request a leave (employee)
// @route   POST /api/v1/leaves
const requestLeave = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const userId = req.user._id;

    if (!startDate || !endDate || !reason) {
      const error = new Error('startDate, endDate, and reason are required');
      error.statusCode = 400;
      return next(error);
    }

    const leave = await Leave.create({ user: userId, startDate, endDate, reason });
    await leave.populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leaves for the authenticated employee
// @route   GET /api/v1/leaves/my
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Leaves retrieved successfully',
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all leaves (admin/manager)
// @route   GET /api/v1/leaves
const getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const leaves = await Leave.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'All leaves retrieved successfully',
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject a leave (admin/manager)
// @route   PUT /api/v1/leaves/:id
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      const error = new Error('Status must be "approved" or "rejected"');
      error.statusCode = 400;
      return next(error);
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      const error = new Error('Leave request not found');
      error.statusCode = 404;
      return next(error);
    }

    if (leave.status !== 'pending') {
      const error = new Error(`Leave has already been ${leave.status}`);
      error.statusCode = 409;
      return next(error);
    }

    leave.status = status;
    await leave.save();
    await leave.populate('user', 'name email role');

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
