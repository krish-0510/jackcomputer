const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;

    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.auth || req.auth.role !== role) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }

  return next();
};

module.exports = {
  authenticateJWT,
  requireRole,
};
