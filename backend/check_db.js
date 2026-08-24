const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://cartify:K%40mini1661@cartify-shard-00-00.r6ylnlf.mongodb.net:27017,cartify-shard-00-01.r6ylnlf.mongodb.net:27017,cartify-shard-00-02.r6ylnlf.mongodb.net:27017/cartify?ssl=true&authSource=admin';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas Cloud Database');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users found in deployed database:');
    if (users.length === 0) {
        console.log('⚠️ No users found in the cloud database! It is completely empty.');
    } else {
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Role: ${u.role}`);
        });
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Could not connect to MongoDB Atlas. Error:', err.message);
  });
