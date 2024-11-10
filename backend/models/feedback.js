const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    isResolved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
