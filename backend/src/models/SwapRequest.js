import mongoose from 'mongoose';

/**
 * SwapRequest Schema
 * Tracks swap negotiations between users for their time slots
 */
const swapRequestSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  initiatorSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  receiverSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Compound index for efficient querying of user's requests
swapRequestSchema.index({ initiatorId: 1, status: 1 });
swapRequestSchema.index({ receiverId: 1, status: 1 });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;
