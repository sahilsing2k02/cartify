const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cartify')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Item.deleteMany();
    console.log('Database cleared');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedEmployerPassword = await bcrypt.hash('employer123', salt);
    const hashedEmployeePassword = await bcrypt.hash('employee123', salt);

    await User.create([
      {
        username: 'admin',
        password: hashedEmployerPassword,
        role: 'employer'
      },
      {
        username: 'staff',
        password: hashedEmployeePassword,
        role: 'employee'
      }
    ]);
    
    // Create Items
    await Item.create([
      { name: 'Artisanal Bread', price: 4.50 },
      { name: 'Organic Milk (1L)', price: 3.25 },
      { name: 'Fresh Avocado', price: 2.00 },
      { name: 'Premium Coffee 250g', price: 12.99 },
      { name: 'Dark Chocolate 70%', price: 5.50 }
    ]);

    console.log('✅ Success: Users and Items seeded successfully');
    console.log('Admin User: [admin] / [employer123]');
    console.log('Staff User: [staff] / [employee123]');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();

