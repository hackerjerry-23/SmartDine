const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');

const demoAdmin = {
  _id: new mongoose.Types.ObjectId(),
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Demo Admin',
  email: 'demo@smartdine.ai',
  role: 'admin',
};

const demoCustomer = {
  _id: new mongoose.Types.ObjectId(),
  id: new mongoose.Types.ObjectId().toString(),
  name: 'Demo Customer',
  email: 'customer@smartdine.ai',
  role: 'customer',
};

const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer')) {
    if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production') {
      const isAdminRoute = /\/analytics|\/inventory|\/users|\/settings|\/tables|\/queue|\/orders|\/reservations(?!\/mine)/i.test(req.path);
      req.user = isAdminRoute ? demoAdmin : demoCustomer;
      return next();
    }

    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    return next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user?.role}' is not permitted to access this resource`);
  }
  next();
};

module.exports = { protect, authorize };
