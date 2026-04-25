const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getMyAttendance,
  getAllAttendance,
  getTodayStatus,
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Employee actions
router.post('/clock-in',  protect, authorizeRoles('employee'), clockIn);
router.post('/clock-out', protect, authorizeRoles('employee'), clockOut);
router.get('/my',         protect, authorizeRoles('employee'), getMyAttendance);
router.get('/today',      protect, authorizeRoles('employee'), getTodayStatus);

// Admin / manager view
router.get('/', protect, authorizeRoles('admin', 'manager'), getAllAttendance);

module.exports = router;
