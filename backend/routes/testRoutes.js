const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API working', data: null });
});

module.exports = router;
