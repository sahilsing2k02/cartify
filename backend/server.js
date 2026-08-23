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

// Environment variables (strict process.env reading)
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 3000
      });
      isConnected = true;
      console.log('✅ Primary MongoDB connected successfully!');
      return;
    } catch (primaryError) {
      console.warn(`⚠️ Primary MongoDB Atlas connection notice: ${primaryError.message}. Connecting to local fallback...`);
    }
  }

  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/cartify', {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('✅ Local MongoDB connected successfully!');
  } catch (localError) {
    isConnected = false;
    console.error('❌ Local MongoDB connection error:', localError.message);
  }
};

// Connect to database on launch and per request
connectDB();

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Middleware
app.use(express.json());

// CORS - MUST come before routes
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : '';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  frontendUrl
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, or requests without origin header
    if (!origin) {
      return callback(null, true);
    }

    // Allow configured frontend URL and local dev
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    // Allow Vercel or Render domains
    if (/^https:\/\/.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }

    // Fallback: allow origin gracefully to prevent CORS crash
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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