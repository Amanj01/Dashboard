const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // Import upload middleware
const Gallery = require('../models/Gallery');

// Get all galleries
router.get('/', async (req, res) => {
    const galleries = await Gallery.find().populate('product');
    res.json(galleries);
});

// Get a single gallery by ID
router.get('/:id', async (req, res) => {
    const gallery = await Gallery.findById(req.params.id).populate('product');
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
    res.json(gallery);
});

// Add a new gallery with multiple images
router.post('/add', authMiddleware, adminMiddleware, upload.array('images', 10), async (req, res) => {
    const { product } = req.body;

    // Add validation check for files
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
    }

    const gallery = new Gallery({
        product,
        images: req.files.map(file => file.path),
    });

    await gallery.save();
    res.json(gallery);
});


// Delete a gallery
router.delete('/delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const deletedGallery = await Gallery.findByIdAndDelete(req.params.id);
        if (!deletedGallery) {
            return res.status(404).json({ message: 'Gallery not found' });
        }
        res.json({ message: 'Gallery deleted successfully', gallery: deletedGallery });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gallery', error: error.message });
    }
});


// Update gallery images
router.put('/update/:id', authMiddleware, adminMiddleware, upload.array('images', 10), async (req, res) => {
    const updateData = { ...req.body };
    if (req.files) {
        updateData.images = req.files.map(file => file.path);
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedGallery);
});

module.exports = router;
