const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const User = require('../models/user');

// Get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.find({ isDeleted: false });
    res.json(users);
});

// Get a single user by ID
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });
    res.json(user);
});

// Add a new user (Admin only)
router.post('/add', authMiddleware, adminMiddleware, async (req, res) => {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.json(user);
});

// Soft delete a user
router.delete('/soft-delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'User soft deleted' });
});

// Permanently delete a user
router.delete('/permanent-delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User permanently deleted' });
});

router.get('/me', authMiddleware, async(req, res) => {
    return json({...req.user});
})

module.exports = router;
