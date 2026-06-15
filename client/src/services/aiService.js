import api from '../api/axios';

export const aiService = {
  askQuestion: (question) => api.post('/ai/ask', { question }),
  getWeeklySummary: () => api.post('/ai/weekly-summary'),
  getChurnAnalysis: () => api.post('/ai/churn-analysis'),
  getReorderAdvice: () => api.post('/ai/reorder-advice')
};

export default aiService;
