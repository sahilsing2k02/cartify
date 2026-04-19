const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      console.warn('⚠️ WARNING: You are trying to use a local MongoDB connection! For persistent data and online deployment, please ensure MONGO_URI in your .env is set to a MongoDB Atlas cluster URI.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully to persistent database');

    // Remove auto-seeding for production since we want to keep data persistently
    // If you need the initial users, run 'node seed.js' manually once.

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server. Make sure your MongoDB URI is correct and network access is allowed:', error);
    process.exit(1);
  }
};

startServer();
