// Cartify Express Server Entry Point

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();

// Force IPv4 first for DNS lookup
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (error) {
  console.log('DNS configuration skipped');
}

const app = express();

// Environment variables
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Check required environment variables
if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined');
}

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined');
}

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    isConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
  }
};

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// CORS - MUST come before routes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, server-to-server requests, etc.
    if (!origin) {
      return callback(null, true);
    }

    // Allow explicitly configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel deployments
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Cartify Backend API Service',
    database: isConnected ? 'connected' : 'connecting',
    frontend: process.env.FRONTEND_URL || 'not configured'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cartify Backend API running on port ${PORT}`);
  });
};

startServer();

module.exports = app;