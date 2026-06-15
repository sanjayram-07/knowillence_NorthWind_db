const salesService = require('../services/salesService');

const getOverview = async (req, res, next) => {
  try {
    const data = await salesService.getOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMonthlyRevenue = async (req, res, next) => {
  try {
    const data = await salesService.getMonthlyRevenue();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCategoryRevenue = async (req, res, next) => {
  try {
    const data = await salesService.getCategoryRevenue();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTopProductsList = async (req, res, next) => {
  try {
    const data = await salesService.getTopProductsList(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTopCustomersList = async (req, res, next) => {
  try {
    const data = await salesService.getTopCustomersList(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCountryRevenue = async (req, res, next) => {
  try {
    const data = await salesService.getCountryRevenue();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getMonthlyRevenue,
  getCategoryRevenue,
  getTopProductsList,
  getTopCustomersList,
  getCountryRevenue
};
