const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('./models/User');
const Item = require('./models/Item');

// Use Google DNS for Atlas SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cartify')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedDB = async () => {
  try {
    // Seed Users if they don't exist
    const adminExists = await User.findOne({ username: 'admin' });
    const staffExists = await User.findOne({ username: 'staff' });

    const salt = await bcrypt.genSalt(10);
    
    if (!adminExists) {
      const hashedEmployerPassword = await bcrypt.hash('employer123', salt);
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

