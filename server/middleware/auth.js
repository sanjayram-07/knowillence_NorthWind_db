const crypto = require('crypto');
const { USERS } = require('../config/users');

const sessions = new Map();

const createSession = (user) => {
  const token = crypto.randomBytes(24).toString('hex');
  const session = {
    username: user.username,
    role: user.role,
    name: user.name
  };
  sessions.set(token, session);
  return { token, user: session };
};

const authenticate = (username, password) => {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  return createSession(user);
};

const authRequired = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  req.user = sessions.get(token);
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticate,
  authRequired,
  adminOnly
};
