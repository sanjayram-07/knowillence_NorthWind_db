const groqService = require('./groqService');
const {
  getSalesOverview,
  getRevenueByMonth,
  getTopProducts,
  getTopCustomers,
  getLowStockProducts,
  getAtRiskCustomers,
  getRevenueByCategory
} = require('../utils/aggregations');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { createServiceError } = require('./serviceError');

const askQuestion = async ({ question } = {}) => {
  if (!question) {
    throw createServiceError(400, 'Question is required');
  }

  const lowerQ = question.toLowerCase();
  const relevantData = {};

  if (lowerQ.includes('customer') || lowerQ.includes('churn')) {
    relevantData.topCustomers = await getTopCustomers(10);
    relevantData.atRiskCustomers = await getAtRiskCustomers(90);
  } else if (lowerQ.includes('product') || lowerQ.includes('stock') || lowerQ.includes('inventory')) {
    relevantData.topProducts = await getTopProducts(10);
    relevantData.lowStock = await getLowStockProducts();
  } else if (lowerQ.includes('revenue') || lowerQ.includes('sales') || lowerQ.includes('money')) {
    relevantData.overview = await getSalesOverview();
    relevantData.revenueByMonth = await getRevenueByMonth();
    relevantData.revenueByCategory = await getRevenueByCategory();
  } else if (lowerQ.includes('order')) {
    relevantData.overview = await getSalesOverview();
    relevantData.recentOrders = await Order.find()
      .sort({ OrderDate: -1 })
      .limit(10)
      .lean();
  } else if (lowerQ.includes('supplier')) {
    relevantData.suppliers = await Supplier.find().lean();
  } else {
    relevantData.overview = await getSalesOverview();
    relevantData.topProducts = await getTopProducts(5);
    relevantData.topCustomers = await getTopCustomers(5);
  }

  const answer = await groqService.askQuestion(question, relevantData);
  return { answer };
};

const getWeeklySummary = async () => {
  const overview = await getSalesOverview();
  const topProducts = await getTopProducts(5);
  const topCustomers = await getTopCustomers(5);
  const lowStock = await getLowStockProducts();
  const pendingOrders = await Order.countDocuments({ ShippedDate: null });

  const data = {
    revenue: overview.totalRevenue,
    orders: overview.totalOrders,
    avgOrderValue: overview.avgOrderValue,
    topProducts,
    topCustomers,
    lowStockCount: lowStock.length,
    pendingOrders
  };

  return groqService.generateWeeklySummary(data);
};

const getChurnAnalysis = async () => {
  const atRiskCustomers = await getAtRiskCustomers(90);
  return groqService.analyzeChurnRisk(atRiskCustomers);
};

const getReorderAdvice = async () => {
  const lowStockProducts = await getLowStockProducts();
  return groqService.getReorderAdvice(lowStockProducts);
};

module.exports = {
  askQuestion,
  getWeeklySummary,
  getChurnAnalysis,
  getReorderAdvice
};
