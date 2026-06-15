const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    error: 'Too many AI requests, please wait 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = aiLimiter;
