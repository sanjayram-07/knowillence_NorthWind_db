import api from '../api/axios';

export const salesService = {
  getOverview: () => api.get('/sales/overview'),
  getRevenueByMonth: () => api.get('/sales/revenue-by-month'),
  getRevenueByCategory: () => api.get('/sales/revenue-by-category'),
  getTopProducts: (limit = 10) => api.get(`/sales/top-products?limit=${limit}`),
  getTopCustomers: (limit = 10) => api.get(`/sales/top-customers?limit=${limit}`),
  getByCountry: () => api.get('/sales/by-country')
};

export default salesService;
