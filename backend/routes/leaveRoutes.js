const express = require('express');
const router = express.Router();
const {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorizeRoles('employee'), requestLeave)
  .get(protect, authorizeRoles('admin', 'manager'), getAllLeaves);

router.route('/my').get(protect, authorizeRoles('employee'), getMyLeaves);

router.route('/:id').put(protect, authorizeRoles('admin', 'manager'), updateLeaveStatus);

module.exports = router;
