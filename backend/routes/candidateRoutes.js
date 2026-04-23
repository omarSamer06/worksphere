const express = require('express');
const router = express.Router();
const {
  createCandidate,
  getCandidates,
  updateCandidateStatus,
  hireCandidate,
} = require('../controllers/candidateController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorizeRoles('admin'), createCandidate)
  .get(protect, authorizeRoles('admin', 'manager'), getCandidates);

router.put('/:id/status', protect, authorizeRoles('admin'), updateCandidateStatus);
router.post('/:id/hire', protect, authorizeRoles('admin'), hireCandidate);

module.exports = router;
