const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: [true, 'Please provide recipient name'],
      trim: true
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'packed', 'delivered'],
      default: 'pending'
    },
    remark: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
