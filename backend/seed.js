const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cartify')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const seedDB = async () => {
  try {
    await User.deleteMany(); // Clear existing users for clean start
    console.log('Users cleared');

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
    
    console.log('Users Seeded Successfully:');
    console.log('Admin: username [admin], password [employer123]');
    console.log('Staff: username [staff], password [employee123]');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
