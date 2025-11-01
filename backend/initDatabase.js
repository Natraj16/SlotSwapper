import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Event from './src/models/Event.js';
import SwapRequest from './src/models/SwapRequest.js';

// Load environment variables
dotenv.config();

/**
 * Database Initialization Script
 * Creates MongoDB collections and indexes for SlotSwapper
 */

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing SlotSwapper Database...\n');

    // Check if MONGODB_URI is configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
      console.error('❌ Error: MongoDB URI not configured!');
      console.error('Please edit backend/.env and add your MongoDB Atlas connection string.\n');
      console.error('Get your connection string from:');
      console.error('https://cloud.mongodb.com → Connect → Connect your application\n');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db;

    // Get list of existing collections
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(col => col.name);

    console.log('📦 Creating Collections and Indexes...\n');

    // Initialize Users collection
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created "users" collection');
    } else {
      console.log('ℹ️  "users" collection already exists');
    }

    // Create indexes for users
    await User.createIndexes();
    console.log('   → Created unique index on email');

    // Initialize Events collection
    if (!collectionNames.includes('events')) {
      await db.createCollection('events');
      console.log('✅ Created "events" collection');
    } else {
      console.log('ℹ️  "events" collection already exists');
    }

    // Create indexes for events
    await Event.createIndexes();
    console.log('   → Created index on userId');
    console.log('   → Created index on status');

    // Initialize SwapRequests collection
    if (!collectionNames.includes('swaprequests')) {
      await db.createCollection('swaprequests');
      console.log('✅ Created "swaprequests" collection');
    } else {
      console.log('ℹ️  "swaprequests" collection already exists');
    }

    // Create indexes for swap requests
    await SwapRequest.createIndexes();
    console.log('   → Created index on initiatorId');
    console.log('   → Created index on receiverId');
    console.log('   → Created index on status');

    // Display database info
    console.log('\n📊 Database Information:');
    const dbName = db.databaseName;
    console.log(`   Database: ${dbName}`);

    const collections = await db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Display statistics
    console.log('\n📈 Collection Statistics:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const indexes = await db.collection(collection.name).indexes();
      console.log(`   ${collection.name}:`);
      console.log(`     Documents: ${count}`);
      console.log(`     Indexes: ${indexes.length}`);
    }

    console.log('\n✨ Database initialization complete!');
    console.log('\n🚀 You can now start the server with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Tip: Check your username and password in .env file');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Tip: Check your internet connection and MongoDB Atlas network access settings');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run initialization
initializeDatabase();
