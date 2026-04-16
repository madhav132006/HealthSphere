const express = require('express');
const router = express.Router();
const { analyzeSymptoms, getHistory } = require('../controllers/aiController');
const { auth, optionalAuth } = require('../middleware/auth');

router.post('/analyze', optionalAuth, analyzeSymptoms);
router.get('/history', auth, getHistory);

module.exports = router;
