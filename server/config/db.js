const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[${new Date().toISOString()}] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
