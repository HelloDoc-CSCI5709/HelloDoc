const mongoose = require('mongoose');
const { MONGO_URI } = require('./Constants');

async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`MongoDB URI: ${MONGO_URI}`);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
