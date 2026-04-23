const express = require('express');
const router = express.Router();
const {
  createPosition,
  getPositions,
  updatePosition,
  deletePosition,
} = require('../controllers/positionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createPosition)
  .get(protect, getPositions);

router
  .route('/:id')
  .put(protect, authorizeRoles('admin'), updatePosition)
  .delete(protect, authorizeRoles('admin'), deletePosition);

module.exports = router;
