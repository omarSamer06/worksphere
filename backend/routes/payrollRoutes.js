const express = require('express');
const router  = express.Router();
const { generatePayroll, getMyPayslip, getAllPayroll } = require('../controllers/payrollController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorizeRoles('admin'), generatePayroll);
router.get('/my',        protect, authorizeRoles('employee'), getMyPayslip);
router.get('/',          protect, authorizeRoles('admin'), getAllPayroll);

module.exports = router;
