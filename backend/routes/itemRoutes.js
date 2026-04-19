const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, employerOnly } = require('../middleware/authMiddleware');

// @route   GET /api/items
// @desc    Get all items (Accessible by both employer and employee)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await Item.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private/Employer
router.post('/', protect, employerOnly, async (req, res) => {
  const { name, price } = req.body;
  try {
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const item = new Item({ name, price });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating item' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private/Employer
router.put('/:id', protect, employerOnly, async (req, res) => {
  const { name, price } = req.body;
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (name) item.name = name;
    if (price !== undefined) item.price = price;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating item' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private/Employer
router.delete('/:id', protect, employerOnly, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

module.exports = router;
