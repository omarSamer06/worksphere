const express = require('express');
const router = express.Router();
const { createShift, getShifts, updateShift, deleteShift } = require('../controllers/shiftController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createShift)
  .get(protect, getShifts);

router
  .route('/:id')
  .put(protect, authorizeRoles('admin'), updateShift)
  .delete(protect, authorizeRoles('admin'), deleteShift);

module.exports = router;
