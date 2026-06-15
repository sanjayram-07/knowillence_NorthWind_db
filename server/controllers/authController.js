const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, me };
