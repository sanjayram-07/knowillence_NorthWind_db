import api from '../api/axios';

export const orderService = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return api.get(`/orders?${searchParams.toString()}`);
  },
  getById: (id) => api.get(`/orders/${id}`),
  getRecent: (limit = 10) => api.get(`/orders/recent?limit=${limit}`),
  getPending: () => api.get('/orders/pending'),
  getStats: () => api.get('/orders/stats'),
  create: (data) => api.post('/orders', data)
};

export default orderService;
