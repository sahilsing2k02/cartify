const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Validate Environment Variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('❌ CRITICAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      console.warn('⚠️  WARNING: You are using a local MongoDB connection. For persistent data and online deployment, ensure MONGO_URI is set to a MongoDB Atlas cluster.');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Check your MongoDB URI and network access permissions.');
    process.exit(1);
  }
};

startServer();

