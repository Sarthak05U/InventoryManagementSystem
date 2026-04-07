const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_management';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ Database connection error: ${error.message}`);
    console.error(`\nMake sure MongoDB is installed and running:`);
    console.error(`  - Ubuntu/Debian: sudo systemctl start mongod`);
    console.error(`  - macOS:         brew services start mongodb-community@7.0`);
    console.error(`  - Windows:       net start MongoDB`);
    console.error(`  - Or run:        bash setup.sh   (auto-installs MongoDB)\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
