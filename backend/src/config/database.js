import mongoose from 'mongoose';

/**
 * MongoDB Connection Configuration
 * Connects to MongoDB Atlas using the connection string from environment variables
 */
const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`⚠️  Server will continue running, but database features won't work.`);
    console.error(`💡 Fix: Add your IP to MongoDB Atlas Network Access (0.0.0.0/0 for development)`);
    // Don't crash the server - let it run and retry connection
  }
};

export default connectDatabase;
