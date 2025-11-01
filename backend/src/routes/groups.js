import express from 'express';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/groups/create
 * @desc    Create a new group
 * @access  Private
 */
router.post('/create', async (req, res) => {
  try {
    const { name, groupType, description } = req.body;

    // Validation
    if (!name || !groupType) {
      return res.status(400).json({ message: 'Please provide group name and type' });
    }

    // Generate unique group code
    const code = await Group.generateCode();

    // Create group
    const group = await Group.create({
      name,
      code,
      groupType,
      description: description || '',
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically a member
    });

    // Add group to user's groups and set as current group
    req.user.groups.push(group._id);
    req.user.currentGroup = group._id;
    await req.user.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    const updatedUser = await User.findById(req.user._id)
      .populate('currentGroup')
      .populate('groups');

    res.status(201).json({
      message: 'Group created successfully',
      group: populatedGroup,
      updatedUser: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        groups: updatedUser.groups,
        currentGroup: updatedUser.currentGroup,
      },
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error creating group' });
  }
});

/**
 * @route   POST /api/groups/join
 * @desc    Join a group using group code
 * @access  Private
 */
router.post('/join', async (req, res) => {
  try {
    const { code } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ message: 'Please provide group code' });
    }

    // Find group by code
    const group = await Group.findOne({ code: code.toUpperCase(), isActive: true });

    if (!group) {
      return res.status(404).json({ message: 'Group not found. Please check the code.' });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    await group.addMember(req.user._id);

    // Add group to user's groups and set as current group
    if (!req.user.groups.includes(group._id)) {
      req.user.groups.push(group._id);
    }
    req.user.currentGroup = group._id;
    await req.user.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    const updatedUser = await User.findById(req.user._id)
      .populate('currentGroup')
      .populate('groups');

    res.json({
      message: 'Successfully joined group',
      group: populatedGroup,
      updatedUser: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        groups: updatedUser.groups,
        currentGroup: updatedUser.currentGroup,
      },
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error joining group' });
  }
});

/**
 * @route   GET /api/groups/my-groups
 * @desc    Get all groups the user is a member of
 * @access  Private
 */
router.get('/my-groups', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'groups',
      populate: {
        path: 'createdBy members',
        select: 'name email',
      },
    });

    res.json(user.groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error fetching groups' });
  }
});

/**
 * @route   PUT /api/groups/switch/:groupId
 * @desc    Switch to a different group as current active group
 * @access  Private
 */
router.put('/switch/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of this group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Update current group
    req.user.currentGroup = groupId;
    await req.user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('currentGroup')
      .populate('groups');

    res.json({
      message: 'Switched to group successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        groups: updatedUser.groups,
        currentGroup: updatedUser.currentGroup,
      },
    });
  } catch (error) {
    console.error('Switch group error:', error);
    res.status(500).json({ message: 'Server error switching group' });
  }
});

/**
 * @route   GET /api/groups/:groupId
 * @desc    Get group details
 * @access  Private
 */
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error fetching group' });
  }
});

/**
 * @route   POST /api/groups/:groupId/leave
 * @desc    Leave a group
 * @access  Private
 */
router.post('/:groupId/leave', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Can't leave if you're the creator and there are other members
    if (group.createdBy.toString() === req.user._id.toString() && group.members.length > 1) {
      return res.status(400).json({ 
        message: 'Cannot leave group as creator. Transfer ownership or wait for all members to leave.' 
      });
    }

    // Remove user from group
    await group.removeMember(req.user._id);

    // Remove group from user's groups
    req.user.groups = req.user.groups.filter(g => g.toString() !== group._id.toString());
    
    if (req.user.currentGroup?.toString() === group._id.toString()) {
      req.user.currentGroup = req.user.groups[0] || null;
    }
    
    await req.user.save();

    const updatedUser = await User.findById(req.user._id)
      .populate('currentGroup')
      .populate('groups');

    res.json({ 
      message: 'Successfully left the group',
      updatedUser: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        groups: updatedUser.groups,
        currentGroup: updatedUser.currentGroup,
      },
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error leaving group' });
  }
});

export default router;
