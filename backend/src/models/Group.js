import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Group Schema
 * Represents organizations/communities where users can swap slots
 */
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },
  groupType: {
    type: String,
    enum: ['workplace', 'academic', 'community', 'friends', 'other'],
    required: [true, 'Group type is required'],
    default: 'other',
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

/**
 * Generate a unique 6-character group code
 */
groupSchema.statics.generateCode = async function() {
  let code;
  let exists = true;
  
  while (exists) {
    // Generate random 6-character code (uppercase letters and numbers)
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    exists = await this.findOne({ code });
  }
  
  return code;
};

/**
 * Add a member to the group
 */
groupSchema.methods.addMember = async function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    await this.save();
  }
  return this;
};

/**
 * Remove a member from the group
 */
groupSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

const Group = mongoose.model('Group', groupSchema);

export default Group;
