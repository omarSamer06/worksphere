const Shift = require('../models/shiftModel');

// @desc    Create shift
// @route   POST /api/v1/shifts
const createShift = async (req, res, next) => {
  try {
    const { name, startTime, endTime, gracePeriodMinutes } = req.body;
    if (!name || !startTime || !endTime) {
      const err = new Error('Name, startTime and endTime are required');
      err.statusCode = 400;
      return next(err);
    }

    const shift = await Shift.create({ name, startTime, endTime, gracePeriodMinutes });
    res.status(201).json({ success: true, message: 'Shift created', data: shift });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all shifts
// @route   GET /api/v1/shifts
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find().sort({ name: 1 });
    res.status(200).json({ success: true, message: 'Shifts retrieved', data: shifts });
  } catch (err) {
    next(err);
  }
};

// @desc    Update shift
// @route   PUT /api/v1/shifts/:id
const updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!shift) {
      const err = new Error('Shift not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, message: 'Shift updated', data: shift });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete shift
// @route   DELETE /api/v1/shifts/:id
const deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      const err = new Error('Shift not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, message: 'Shift deleted', data: null });
  } catch (err) {
    next(err);
  }
};

module.exports = { createShift, getShifts, updateShift, deleteShift };
