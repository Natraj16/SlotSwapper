import express from 'express';
import Event from '../models/Event.js';
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { notifyUser } from '../websocket/websocketServer.js';

const router = express.Router();

router.use(protect);

router.get('/swappable-slots', async (req, res) => {
  try {
    if (!req.user.currentGroup) {
      return res.status(400).json({ 
        message: 'Please create or join a group first to see swappable slots' 
      });
    }

    const currentGroup = req.user.currentGroup;
    
    const groupUsers = await User.find({
      currentGroup: currentGroup,
      _id: { $ne: req.user._id },
    }).select('_id');
    
    const groupUserIds = groupUsers.map(u => u._id);
    
    const swappableSlots = await Event.find({
      status: 'SWAPPABLE',
      userId: { $in: groupUserIds },
    })
      .populate('userId', 'name email')
      .sort({ startTime: 1 });

    res.json(swappableSlots);
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ message: 'Server error fetching swappable slots' });
  }
});

/**
 * @route   POST /api/swap-request
 * @desc    Request a swap between two slots
 * @access  Private
 */
router.post('/swap-request', async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ 
        message: 'Please provide both mySlotId and theirSlotId' 
      });
    }

    const [mySlot, theirSlot] = await Promise.all([
      Event.findById(mySlotId),
      Event.findById(theirSlotId),
    ]);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both slots not found' });
    }

    if (mySlot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own the offered slot' });
    }

    if (theirSlot.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap with yourself' });
    }

    const otherUser = await User.findById(theirSlot.userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'Other user not found' });
    }

    if (otherUser.organization !== req.user.organization) {
      return res.status(403).json({ 
        message: 'Cannot swap slots with users from different organizations' 
      });
    }

    if (mySlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Your slot is not swappable' });
    }
    if (theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Their slot is not swappable' });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      initiatorId: req.user._id,
      receiverId: theirSlot.userId,
      initiatorSlotId: mySlotId,
      receiverSlotId: theirSlotId,
      status: 'PENDING',
    });

    // Update both slots to SWAP_PENDING
    await Promise.all([
      Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }),
      Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' }),
    ]);

    // Populate the swap request with full details
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('initiatorId', 'name email')
      .populate('receiverId', 'name email')
      .populate('initiatorSlotId')
      .populate('receiverSlotId');

    // Send real-time notification to receiver
    notifyUser(theirSlot.userId.toString(), {
      type: 'NEW_SWAP_REQUEST',
      data: populatedRequest,
    });

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest: populatedRequest,
    });
  } catch (error) {
    console.error('Swap request error:', error);
    res.status(500).json({ message: 'Server error creating swap request' });
  }
});

/**
 * @route   POST /api/swap-response/:requestId
 * @desc    Accept or reject a swap request
 * @access  Private
 */
router.post('/swap-response/:requestId', async (req, res) => {
  try {
    const { accept } = req.body; // boolean: true for accept, false for reject
    const { requestId } = req.params;

    // Validation
    if (typeof accept !== 'boolean') {
      return res.status(400).json({ message: 'Please provide accept as boolean' });
    }

    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate('initiatorSlotId')
      .populate('receiverSlotId');

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Verify the current user is the receiver
    if (swapRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to respond to this request' 
      });
    }

    // Check if already responded
    if (swapRequest.status !== 'PENDING') {
      return res.status(400).json({ 
        message: `This request has already been ${swapRequest.status.toLowerCase()}` 
      });
    }

    if (accept) {
      // ACCEPT: Perform the swap
      const initiatorSlot = swapRequest.initiatorSlotId;
      const receiverSlot = swapRequest.receiverSlotId;

      // Swap the ownership of the slots
      const tempUserId = initiatorSlot.userId;
      initiatorSlot.userId = receiverSlot.userId;
      receiverSlot.userId = tempUserId;

      // Set both slots back to BUSY
      initiatorSlot.status = 'BUSY';
      receiverSlot.status = 'BUSY';

      // Update swap request status
      swapRequest.status = 'ACCEPTED';

      // Save all changes
      await Promise.all([
        initiatorSlot.save(),
        receiverSlot.save(),
        swapRequest.save(),
      ]);

      // Send real-time notification to initiator
      notifyUser(swapRequest.initiatorId.toString(), {
        type: 'SWAP_ACCEPTED',
        data: swapRequest,
      });

      res.json({
        message: 'Swap accepted successfully',
        swapRequest,
      });
    } else {
      // REJECT: Reset slots to SWAPPABLE
      swapRequest.status = 'REJECTED';
      await swapRequest.save();

      await Promise.all([
        Event.findByIdAndUpdate(swapRequest.initiatorSlotId, { status: 'SWAPPABLE' }),
        Event.findByIdAndUpdate(swapRequest.receiverSlotId, { status: 'SWAPPABLE' }),
      ]);

      // Send real-time notification to initiator
      notifyUser(swapRequest.initiatorId.toString(), {
        type: 'SWAP_REJECTED',
        data: swapRequest,
      });

      res.json({
        message: 'Swap rejected successfully',
        swapRequest,
      });
    }
  } catch (error) {
    console.error('Swap response error:', error);
    res.status(500).json({ message: 'Server error processing swap response' });
  }
});

/**
 * @route   GET /api/swap-requests/incoming
 * @desc    Get incoming swap requests for the current user
 * @access  Private
 */
router.get('/swap-requests/incoming', async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      receiverId: req.user._id,
      status: 'PENDING',
    })
      .populate('initiatorId', 'name email')
      .populate('initiatorSlotId')
      .populate('receiverSlotId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get incoming requests error:', error);
    res.status(500).json({ message: 'Server error fetching incoming requests' });
  }
});

/**
 * @route   GET /api/swap-requests/outgoing
 * @desc    Get outgoing swap requests from the current user
 * @access  Private
 */
router.get('/swap-requests/outgoing', async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      initiatorId: req.user._id,
    })
      .populate('receiverId', 'name email')
      .populate('initiatorSlotId')
      .populate('receiverSlotId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get outgoing requests error:', error);
    res.status(500).json({ message: 'Server error fetching outgoing requests' });
  }
});

export default router;
