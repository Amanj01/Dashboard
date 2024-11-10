const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const Category = require('../models/category');

// Get all categories
router.get('/', async (req, res) => {
    const categories = await Category.find({ isDeleted: false });
    res.json(categories);
});

// Get a single category by ID
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
});

// Add a new category
router.post('/add', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.json(category);
});

// Update a category
router.put('/update/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCategory);
});

// Soft delete a category
router.delete('/soft-delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'Category soft deleted' });
});

// Permanently delete a category
router.delete('/permanent-delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category permanently deleted' });
});

module.exports = router;
