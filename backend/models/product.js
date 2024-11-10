const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    shortDescription: String,
    description: String,
    price: Number,
    thumbnails: { front: String, back: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    gallery: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' }],
    isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Product', productSchema);
