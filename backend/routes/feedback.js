const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const Feedback = require('../models/feedback');

// Get all feedback messages
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
});

// Get a single feedback message by ID
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
});

// Add a new feedback
router.post('/add', async (req, res) => {
    const { name, email, message } = req.body;
    const feedback = new Feedback({ name, email, message });
    await feedback.save();
    res.json(feedback);
});

// Mark feedback as resolved
router.put('/resolve/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { isResolved: true }, { new: true });
    res.json(feedback);
});

// Delete a feedback
router.delete('/delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
});

module.exports = router;
