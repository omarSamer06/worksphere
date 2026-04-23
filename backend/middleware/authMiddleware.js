const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Not authorized, no token provided');
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const error = new Error('Not authorized, user no longer exists');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error('Not authorized, invalid token');
    error.statusCode = 401;
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new Error(
        `Access denied: role '${req.user.role}' is not permitted to perform this action`
      );
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
