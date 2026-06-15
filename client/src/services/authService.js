import api from '../api/axios';

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password })
};

export default authService;
