const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// GET /api/users?role=staff|customer
const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: 'i' };
  res.json(await User.find(filter).select('-password'));
});

// POST /api/users  (admin creates a staff account)
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('Email already in use'); }
  const user = await User.create({ name, email, password, phone, role: 'staff', isVerified: true });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

// PATCH /api/users/:id/role
const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'staff', 'admin'].includes(role)) {
    res.status(400); throw new Error('Invalid role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = { getUsers, createStaff, updateRole, deleteUser };
