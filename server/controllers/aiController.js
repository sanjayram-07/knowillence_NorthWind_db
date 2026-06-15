const aiService = require('../services/aiService');

const askQuestion = async (req, res, next) => {
  try {
    const data = await aiService.askQuestion(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getWeeklySummary = async (req, res, next) => {
  try {
    const summary = await aiService.getWeeklySummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

const getChurnAnalysis = async (req, res, next) => {
  try {
    const analysis = await aiService.getChurnAnalysis();
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

const getReorderAdvice = async (req, res, next) => {
  try {
    const advice = await aiService.getReorderAdvice();
    res.json({ success: true, data: advice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion,
  getWeeklySummary,
  getChurnAnalysis,
  getReorderAdvice
};
