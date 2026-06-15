const {
  getSalesOverview,
  getRevenueByMonth,
  getRevenueByCategory,
  getTopProducts,
  getTopCustomers,
  getRevenueByCountry
} = require('../utils/aggregations');

const getOverview = async () => getSalesOverview();

const getMonthlyRevenue = async () => getRevenueByMonth();

const getCategoryRevenue = async () => getRevenueByCategory();

const getTopProductsList = async (query = {}) => {
  const limit = parseInt(query.limit, 10) || 10;
  return getTopProducts(limit);
};

const getTopCustomersList = async (query = {}) => {
  const limit = parseInt(query.limit, 10) || 10;
  return getTopCustomers(limit);
};

const getCountryRevenue = async () => getRevenueByCountry();

module.exports = {
  getOverview,
  getMonthlyRevenue,
  getCategoryRevenue,
  getTopProductsList,
  getTopCustomersList,
  getCountryRevenue
};
