import api from '../api/axios';

export const supplierService = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`)
};

export default supplierService;
