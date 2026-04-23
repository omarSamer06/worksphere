const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Own profile — must be before /:id
router.route('/me')
  .get(protect, getMe)
  .put(protect, updateProfile);

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createUser)
  .get(protect, authorizeRoles('admin'), getAllUsers);

router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, authorizeRoles('admin'), updateUser)
  .delete(protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
