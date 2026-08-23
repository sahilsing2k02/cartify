// Cartify Express Server Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Force IPv4 first DNS lookup for Windows Node compatibility with Atlas SRV
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore fallback
}

dotenv.config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_cartify_123';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://cartify:K%40mini1661@cartify.r6ylnlf.mongodb.net/cartify?appName=cartify';

let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log('✅ MongoDB connected successfully!');
  } catch (primaryError) {
    console.warn(`⚠️ Primary MongoDB Atlas connection notice: ${primaryError.message}`);
    if (MONGO_URI.includes('mongodb+srv://')) {
      try {
        const clusterDomain = MONGO_URI.split('@')[1]?.split('/')[0];
        if (clusterDomain) {
          const baseName = clusterDomain.split('.')[0];
          const domainSuffix = clusterDomain.substring(baseName.length);
          const directHosts = `${baseName}-shard-00-00${domainSuffix}:27017,${baseName}-shard-00-01${domainSuffix}:27017,${baseName}-shard-00-02${domainSuffix}:27017`;
          const directUri = MONGO_URI.replace('mongodb+srv://', 'mongodb://').replace(clusterDomain, directHosts) + '&ssl=true&authSource=admin';
          await mongoose.connect(directUri, { serverSelectionTimeoutMS: 5000 });
          isConnected = true;
          console.log('✅ MongoDB connected via Direct Seed Hosts!');
          return;
        }
      } catch (e) {
        // Continue to local fallback
      }
    }
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/cartify', { serverSelectionTimeoutMS: 2500 });
      isConnected = true;
      console.log('✅ Connected to Local MongoDB fallback!');
    } catch (localError) {
      console.warn('⚠️ Local MongoDB fallback not active');
    }
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// CORS Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,
  /\.onrender\.com$/
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/tasks', taskRoutes);

// Health check & status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Cartify Backend API Service',
    database: isConnected ? 'connected' : 'connecting',
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
  });
});

// Fallback for non-API web browser navigation (redirect to frontend UI)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    const frontendTarget = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendTarget}${req.originalUrl}`);
  }
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Cartify Backend API running on http://0.0.0.0:${PORT}`);
  });
};

startServer();

module.exports = app;

