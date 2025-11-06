import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Migration script to add groupId to existing events
 * This script assigns events to the user's currentGroup
 * Events for users without a currentGroup are deleted
 */
const migrateEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all events without groupId
    const eventsWithoutGroup = await Event.find({ groupId: { $exists: false } });
    console.log(`\nFound ${eventsWithoutGroup.length} events without groupId`);

    let migrated = 0;
    let deleted = 0;

    for (const event of eventsWithoutGroup) {
      const user = await User.findById(event.userId);
      
      if (!user) {
        console.log(`❌ User not found for event ${event._id}, deleting event`);
        await event.deleteOne();
        deleted++;
        continue;
      }

      if (!user.currentGroup) {
        console.log(`❌ User ${user.email} has no currentGroup, deleting event ${event._id}`);
        await event.deleteOne();
        deleted++;
        continue;
      }

      // Update event with user's currentGroup
      event.groupId = user.currentGroup;
      await event.save();
      console.log(`✅ Migrated event ${event._id} to group ${user.currentGroup}`);
      migrated++;
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  - Migrated: ${migrated} events`);
    console.log(`  - Deleted: ${deleted} events`);
    console.log(`\n✅ Migration completed successfully`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateEvents();
