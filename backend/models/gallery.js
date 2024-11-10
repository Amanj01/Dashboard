const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    images: [String],
});

module.exports = mongoose.model('Gallery', gallerySchema);
