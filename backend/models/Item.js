const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide item price'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    reportedOutOfStock: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Item', itemSchema);
