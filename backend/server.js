// Cartify Express Server Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Use IPv4 first for DNS resolution to ensure SRV record resolution works smoothly across OS environments
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore fallback
}

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/
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

// Root route handler for API status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Cartify Backend API (Render Web Service)',
    frontend: process.env.FRONTEND_URL || 'http://localhost:5173'
  });
});

// Fallback for non-API web browser navigation (redirect to Vite frontend UI)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    const frontendTarget = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendTarget}${req.originalUrl}`);
  }
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/cartify';

  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ MongoDB Atlas connected successfully via SRV URI!');
      return;
    } catch (primaryError) {
      console.warn(`⚠️  Atlas SRV connection failed (${primaryError.message}). Attempting direct Atlas connection...`);
      
      // Auto-construct direct non-SRV connection string for Atlas clusters
      if (primaryUri.includes('mongodb+srv://')) {
        try {
          const directUri = primaryUri
            .replace('mongodb+srv://', 'mongodb://')
            .replace('@cartify.r6ylnlf.mongodb.net/', '@cartify-shard-00-00.r6ylnlf.mongodb.net:27017,cartify-shard-00-01.r6ylnlf.mongodb.net:27017,cartify-shard-00-02.r6ylnlf.mongodb.net:27017/') + '&ssl=true&authSource=admin';
          
          await mongoose.connect(directUri, { serverSelectionTimeoutMS: 3000 });
          console.log('✅ MongoDB Atlas connected successfully via Direct Seed Hosts!');
          return;
        } catch (directError) {
          console.warn(`⚠️  Direct Atlas connection attempt failed (${directError.message}). Attempting local MongoDB...`);
        }
      }
    }
  }

  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected successfully to Local MongoDB!');
  } catch (localError) {
    console.warn('⚠️  Local MongoDB instance not detected. Running server in HTTP mode.');
  }
};

startServer();

