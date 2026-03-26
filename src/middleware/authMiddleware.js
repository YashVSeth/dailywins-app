const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_dailywins_2024';

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requirePartner = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'partner') {
      return res.status(403).json({ message: 'Forbidden: Partner access required' });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
       return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  requireAdmin,
  requirePartner,
  JWT_SECRET
};
