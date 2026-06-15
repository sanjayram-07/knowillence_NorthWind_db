import api from '../api/axios';

export const customerService = {
  getAll: (page = 1, limit = 50, search = '') =>
    api.get(`/customers?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`),
  getById: (id) => api.get(`/customers/${id}`),
  getOrders: (id) => api.get(`/customers/${id}/orders`),
  getAtRisk: () => api.get('/customers/at-risk'),
  getStats: () => api.get('/customers/stats'),
  getWithStats: () => api.get('/customers/with-stats'),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`)
};

export default customerService;
