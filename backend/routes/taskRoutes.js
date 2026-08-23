const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/tasks
// @desc    Create a new packing/delivery task
// @access  Private/Employer
router.post('/', protect, adminOnly, async (req, res) => {
  const { recipient, items } = req.body;
  try {
    if (!recipient || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Recipient and at least one item are required' });
    }
    const formattedItems = items.map(i => ({
      item: i.item || i._id,
      quantity: Number(i.quantity) || 1
    }));
    const task = new Task({
      recipient,
      items: formattedItems,
      createdBy: req.user.id
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({ message: error.message || 'Error creating task' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  console.log('GET /api/tasks hit');
  try {
    const tasks = await Task.find({})
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.status = status;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating task status' });
  }
});

// @route   PUT /api/tasks/:id/remark
// @desc    Save a staff remark on a task
// @access  Private
router.put('/:id/remark', protect, async (req, res) => {
  const { remark } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.remark = remark;
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error saving remark' });
  }
});

module.exports = router;
