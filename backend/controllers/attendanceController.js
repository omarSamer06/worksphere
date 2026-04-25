const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

/* ── helpers ── */
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const parseHHMM = (str) => {
  const [h, m] = str.split(':').map(Number);
  return { h, m };
};

const populateAttendance = (query) =>
  query.populate('user', 'name email role department position').populate({
    path: 'user',
    populate: { path: 'department', select: 'name' },
  });

// @desc    Clock in
// @route   POST /api/v1/attendance/clock-in
const clockIn = async (req, res, next) => {
  try {
    const { start, end } = todayRange();

    const existing = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: start, $lt: end },
    });

    if (existing) {
      const err = new Error('You have already clocked in today');
      err.statusCode = 409;
      return next(err);
    }

    // Load user with their shift
    const user = await User.findById(req.user._id).populate('shift');
    const now = new Date();
    let status = 'on-time';
    let shiftSnapshot = { name: null, startTime: null, endTime: null };

    if (user.shift) {
      const { h, m } = parseHHMM(user.shift.startTime);
      const grace = user.shift.gracePeriodMinutes ?? 15;

      const shiftStart = new Date(now);
      shiftStart.setHours(h, m, 0, 0);

      const deadline = new Date(shiftStart.getTime() + grace * 60 * 1000);

      if (now > deadline) status = 'late';

      shiftSnapshot = {
        name:      user.shift.name,
        startTime: user.shift.startTime,
        endTime:   user.shift.endTime,
      };
    }

    const record = await Attendance.create({
      user:          req.user._id,
      date:          start,
      clockIn:       now,
      status,
      shiftSnapshot,
    });

    res.status(201).json({
      success: true,
      message: `Clocked in — ${status === 'late' ? 'marked as late' : 'on time'}`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clock out
// @route   POST /api/v1/attendance/clock-out
const clockOut = async (req, res, next) => {
  try {
    const { start, end } = todayRange();

    const record = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: start, $lt: end },
    });

    if (!record) {
      const err = new Error('No clock-in record found for today');
      err.statusCode = 404;
      return next(err);
    }

    if (record.clockOut) {
      const err = new Error('You have already clocked out today');
      err.statusCode = 409;
      return next(err);
    }

    record.clockOut = new Date();
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user's attendance
// @route   GET /api/v1/attendance/my
const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const filter = { user: req.user._id };

    if (month && year) {
      const from = new Date(Number(year), Number(month) - 1, 1);
      const to   = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: from, $lt: to };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'Attendance retrieved',
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all attendance records (admin / manager)
// @route   GET /api/v1/attendance
const getAllAttendance = async (req, res, next) => {
  try {
    const { month, year, userId, status } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (status && ['on-time', 'late'].includes(status)) filter.status = status;

    if (month && year) {
      const from = new Date(Number(year), Number(month) - 1, 1);
      const to   = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: from, $lt: to };
    }

    const records = await populateAttendance(
      Attendance.find(filter).sort({ date: -1, clockIn: -1 })
    );

    res.status(200).json({
      success: true,
      message: 'All attendance retrieved',
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's status for the logged-in user (for the clock widget)
// @route   GET /api/v1/attendance/today
const getTodayStatus = async (req, res, next) => {
  try {
    const { start, end } = todayRange();
    const record = await Attendance.findOne({
      user: req.user._id,
      date: { $gte: start, $lt: end },
    });

    res.status(200).json({
      success: true,
      message: 'Today status retrieved',
      data: record ?? null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { clockIn, clockOut, getMyAttendance, getAllAttendance, getTodayStatus };
