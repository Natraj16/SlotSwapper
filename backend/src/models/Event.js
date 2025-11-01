import mongoose from 'mongoose';

/**
 * Event Schema
 * Represents time slots/calendar events that can be swapped between users
 */
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time',
    },
  },
  status: {
    type: String,
    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
    default: 'BUSY',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for efficient querying by status
eventSchema.index({ status: 1 });

// Index for efficient querying by user and status combination
eventSchema.index({ userId: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
