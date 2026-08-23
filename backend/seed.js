const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('./models/User');
const Item = require('./models/Item');

dotenv.config();

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/cartify';

  if (primaryUri) {
    try {
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to Primary MongoDB Atlas for Seeding');
      return;
    } catch (err) {
      console.warn(`⚠️ Primary MongoDB Atlas connection failed (${err.message}). Attempting fallback to local MongoDB...`);
    }
  }

  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to Local MongoDB for Seeding');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

const seedDB = async () => {
  try {
    await connectDB();
    // Seed Users if they don't exist
    const adminExists = await User.findOne({ username: 'admin' });
    const staffExists = await User.findOne({ username: 'staff' });

    const salt = await bcrypt.genSalt(10);
    
    if (!adminExists) {
      const hashedEmployerPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        username: 'admin',
        password: hashedEmployerPassword,
        role: 'admin'
      });
      console.log('✅ Admin user seeded');
    } else {
      console.log('ℹ️ Admin user already exists, skipping');
    }

    if (!staffExists) {
      const hashedEmployeePassword = await bcrypt.hash('employee123', salt);
      await User.create({
        username: 'staff',
        password: hashedEmployeePassword,
        role: 'employee'
      });
      console.log('✅ Staff user seeded');
    } else {
      console.log('ℹ️ Staff user already exists, skipping');
    }
    
    // Seed Items if collection is completely empty
    const itemCount = await Item.countDocuments();
    if (itemCount === 0) {
      await Item.create([
        { name: 'Artisanal Bread', price: 4.50, stock: 25 },
        { name: 'Organic Milk (1L)', price: 3.25, stock: 30 },
        { name: 'Fresh Avocado', price: 2.00, stock: 50 },
        { name: 'Premium Coffee 250g', price: 12.99, stock: 15 },
        { name: 'Dark Chocolate 70%', price: 5.50, stock: 40 }
      ]);
      console.log('✅ Default items seeded');
    } else {
      console.log('ℹ️ Items already exist, skipping item seeding');
    }

    console.log('✅ Database seeding process complete');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();

