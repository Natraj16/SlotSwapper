import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    if (!req.user.currentGroup) {
      return res.json([]);
    }
    
    const events = await Event.find({ 
      userId: req.user._id,
      groupId: req.user.currentGroup
    }).sort({ startTime: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!req.user.currentGroup) {
      return res.status(400).json({ message: 'Please join or create a group first' });
    }

    const event = await Event.create({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status,
      userId: req.user._id,
      groupId: req.user.currentGroup,
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: error.message || 'Server error creating event' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      groupId: req.user.currentGroup
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Don't allow updating if event is in SWAP_PENDING state
    if (event.status === 'SWAP_PENDING' && req.body.status !== 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot update event while swap is pending' 
      });
    }

    // Update fields
    const { title, startTime, endTime, status } = req.body;
    if (title) event.title = title;
    if (startTime) event.startTime = new Date(startTime);
    if (endTime) event.endTime = new Date(endTime);
    if (status) event.status = status;

    await event.save();

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: error.message || 'Server error updating event' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      groupId: req.user.currentGroup
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Don't allow deletion if event is in SWAP_PENDING state
    if (event.status === 'SWAP_PENDING') {
      return res.status(400).json({ 
        message: 'Cannot delete event while swap is pending' 
      });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

export default router;
