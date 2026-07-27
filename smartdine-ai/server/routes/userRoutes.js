const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, createStaff, updateRole, deleteUser } = require('../controllers/userController');

router.use(protect, authorize('admin'));
router.get('/', getUsers);
router.post('/', createStaff);
router.patch('/:id/role', updateRole);
router.delete('/:id', deleteUser);

module.exports = router;
