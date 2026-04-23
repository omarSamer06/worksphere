const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createDepartment)
  .get(protect, getDepartments);

router
  .route('/:id')
  .put(protect, authorizeRoles('admin'), updateDepartment)
  .delete(protect, authorizeRoles('admin'), deleteDepartment);

module.exports = router;
