const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
      },
      name: String, 
      price: Number,
      quantity: {
        type: Number,
        required: true,
      },
    }
  ],
  remark: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'packed', 'delivered'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
