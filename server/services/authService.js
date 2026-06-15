const { authenticate } = require('../middleware/auth');
const { createServiceError } = require('./serviceError');

const login = async ({ username, password } = {}) => {
  if (!username || !password) {
    throw createServiceError(400, 'Username and password required');
  }

  const result = authenticate(username.trim(), password);

  if (!result) {
    throw createServiceError(401, 'Invalid credentials');
  }

  return result;
};

const getCurrentUser = async (user) => user;

module.exports = {
  login,
  getCurrentUser
};
