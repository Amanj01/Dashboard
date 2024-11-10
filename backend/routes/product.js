const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Import upload middleware
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    const products = await Product.find({ isDeleted: false }).populate('category').populate('gallery');
    res.json(products);
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category').populate('gallery');
    if (!product || product.isDeleted) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

// Add a new product with thumbnail images
router.post('/add', authMiddleware, adminMiddleware, upload.fields([
    { name: 'frontThumbnail', maxCount: 1 },
    { name: 'backThumbnail', maxCount: 1 }
]), async (req, res) => {
    const { title, shortDescription, description, price, category } = req.body;

    const product = new Product({
        title,
        shortDescription,
        description,
        price,
        category,
        thumbnails: {
            front: req.files['frontThumbnail'] ? req.files['frontThumbnail'][0].path : null,
            back: req.files['backThumbnail'] ? req.files['backThumbnail'][0].path : null,
        }
    });

    await product.save();
    res.json(product);
});

// soft delete product
router.delete('/soft-delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, { isDeleted: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product soft deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});


// Update a product
router.put('/update/:id', authMiddleware, adminMiddleware, upload.fields([
    { name: 'frontThumbnail', maxCount: 1 },
    { name: 'backThumbnail', maxCount: 1 }
]), async (req, res) => {
    const updateData = { ...req.body };

    // Update thumbnails if provided
    if (req.files['frontThumbnail']) updateData['thumbnails.front'] = req.files['frontThumbnail'][0].path;
    if (req.files['backThumbnail']) updateData['thumbnails.back'] = req.files['backThumbnail'][0].path;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
});

module.exports = router;
