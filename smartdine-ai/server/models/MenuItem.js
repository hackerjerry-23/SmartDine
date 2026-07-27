const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }], // e.g. veg, spicy, bestseller - used by AI recommender
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
