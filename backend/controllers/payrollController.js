const Payroll = require('../models/payrollModel');
const User    = require('../models/userModel');
const Leave   = require('../models/leaveModel');

/* ── helper: days overlap between a leave and a target month ── */
const overlapDays = (leave, monthStart, monthEnd) => {
  const start = leave.startDate > monthStart ? leave.startDate : monthStart;
  // monthEnd is the first moment of the NEXT month (exclusive)
  const rawEnd = leave.endDate < monthEnd ? leave.endDate : new Date(monthEnd - 1);
  if (rawEnd < start) return 0;
  return Math.ceil((rawEnd - start) / (1000 * 60 * 60 * 24)) + 1;
};

const round2 = (n) => Math.round(n * 100) / 100;

// @desc    Generate payroll for all employees for a given month
// @route   POST /api/v1/payroll/generate
const generatePayroll = async (req, res, next) => {
  try {
    const { month } = req.body; // "YYYY-MM"
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      const err = new Error('Provide month in YYYY-MM format (e.g. "2026-04")');
      err.statusCode = 400;
      return next(err);
    }

    const [yr, mo] = month.split('-').map(Number);
    const monthStart = new Date(yr, mo - 1, 1);
    const monthEnd   = new Date(yr, mo, 1); // exclusive

    const users = await User.find({}).select('name email role salary');

    const results = [];

    for (const user of users) {
      const baseSalary = user.salary ?? 0;
      const dailyRate  = baseSalary / 30;

      // Approved leaves overlapping the target month
      const leaves = await Leave.find({
        user:      user._id,
        status:    'approved',
        startDate: { $lt: monthEnd },
        endDate:   { $gte: monthStart },
      });

      let leaveDays = 0;
      for (const leave of leaves) {
        leaveDays += overlapDays(leave, monthStart, monthEnd);
      }

      const deductions  = round2(leaveDays * dailyRate);
      const finalSalary = round2(Math.max(0, baseSalary - deductions));

      const record = await Payroll.findOneAndUpdate(
        { user: user._id, month },
        { baseSalary, leaveDays, deductions, finalSalary },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );

      results.push(record);
    }

    res.status(200).json({
      success: true,
      message: `Payroll generated for ${results.length} employee(s) — ${month}`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user's payslips
// @route   GET /api/v1/payroll/my
const getMyPayslip = async (req, res, next) => {
  try {
    const records = await Payroll.find({ user: req.user._id })
      .sort({ month: -1 })
      .populate('user', 'name email role salary department position');

    res.status(200).json({ success: true, message: 'Payslips retrieved', data: records });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payroll records — admin view
// @route   GET /api/v1/payroll
const getAllPayroll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = req.query.month;

    const records = await Payroll.find(filter)
      .sort({ month: -1, createdAt: -1 })
      .populate('user', 'name email role salary department position');

    res.status(200).json({ success: true, message: 'All payroll retrieved', data: records });
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePayroll, getMyPayslip, getAllPayroll };
