const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      required: [true, 'Please specify a role']
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
