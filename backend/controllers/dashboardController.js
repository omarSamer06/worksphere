const User       = require('../models/userModel');
const Leave      = require('../models/leaveModel');
const Department = require('../models/departmentModel');
const Position   = require('../models/positionModel');
const Candidate  = require('../models/candidateModel');
const Attendance = require('../models/attendanceModel');

// @desc    Return aggregated dashboard statistics (role-aware)
// @route   GET /api/v1/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    /* ── Employee: only their own data ── */
    if (role === 'employee') {
      const [leaves, todayAttendance] = await Promise.all([
        Leave.find({ user: req.user._id }).select('status'),
        (() => {
          const start = new Date(); start.setHours(0, 0, 0, 0);
          const end   = new Date(start); end.setDate(end.getDate() + 1);
          return Attendance.findOne({ user: req.user._id, date: { $gte: start, $lt: end } });
        })(),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Stats retrieved',
        data: {
          totalLeaves:    leaves.length,
          pendingLeaves:  leaves.filter((l) => l.status === 'pending').length,
          approvedLeaves: leaves.filter((l) => l.status === 'approved').length,
          rejectedLeaves: leaves.filter((l) => l.status === 'rejected').length,
          clockedInToday: !!todayAttendance,
          clockedOutToday: !!(todayAttendance?.clockOut),
        },
      });
    }

    /* ── Admin / Manager ── */
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalUsers,
      totalEmployees,
      totalManagers,
      totalDepts,
      totalPositions,
      leaves,
      candidates,
      todayAttendanceCount,
      lateToday,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'manager' }),
      Department.countDocuments(),
      Position.countDocuments(),
      Leave.find().select('status'),
      Candidate.find().select('status hired'),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'late' }),
    ]);

    const pendingLeaves  = leaves.filter((l) => l.status === 'pending').length;
    const approvedLeaves = leaves.filter((l) => l.status === 'approved').length;
    const rejectedLeaves = leaves.filter((l) => l.status === 'rejected').length;

    const totalCandidates = candidates.length;
    const openCandidates  = candidates.filter((c) => !c.hired && c.status !== 'rejected').length;
    const hiredCandidates = candidates.filter((c) => c.hired).length;

    return res.status(200).json({
      success: true,
      message: 'Stats retrieved',
      data: {
        totalUsers,
        totalEmployees,
        totalManagers,
        totalDepts,
        totalPositions,
        totalLeaves:    leaves.length,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        totalCandidates,
        openCandidates,
        hiredCandidates,
        todayAttendanceCount,
        lateToday,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
