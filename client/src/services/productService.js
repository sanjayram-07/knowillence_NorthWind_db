import api from '../api/axios';

export const productService = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return api.get(`/products?${searchParams.toString()}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getDiscontinued: () => api.get('/products/discontinued'),
  getStats: () => api.get('/products/stats'),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`)
};

export default productService;
