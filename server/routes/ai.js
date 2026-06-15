const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiLimiter = require('../middleware/rateLimiter');

router.post('/ask', aiLimiter, aiController.askQuestion);
router.post('/weekly-summary', aiLimiter, aiController.getWeeklySummary);
router.post('/churn-analysis', aiLimiter, aiController.getChurnAnalysis);
router.post('/reorder-advice', aiLimiter, aiController.getReorderAdvice);

module.exports = router;
