const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect, adminOnly } = require('../middleware/authMiddleware');

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
router.post('/', protect, adminOnly, async (req, res) => {
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
router.put('/:id', protect, adminOnly, async (req, res) => {
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
router.delete('/:id', protect, adminOnly, async (req, res) => {
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

// @route   PUT /api/items/:id/stock
// @desc    Update item stock level
// @access  Private/Employer
router.put('/:id/stock', protect, adminOnly, async (req, res) => {
  const { stock } = req.body;
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.stock = stock;
    item.reportedOutOfStock = stock === 0; // Auto-reset if stock added
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating stock' });
  }
});

// @route   PUT /api/items/:id/report
// @desc    Report item as out of stock
// @access  Private
router.put('/:id/report', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.reportedOutOfStock = true;
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error reporting item' });
  }
});

// @route   POST /api/items/checkout
// @desc    Finalize checkout, decrement stock of purchased items
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided for checkout' });
  }

  try {
    // 1. Validate stock level for all items first
    for (const cartItem of items) {
      const dbItem = await Item.findById(cartItem._id);
      if (!dbItem) {
        return res.status(404).json({ message: `Item ${cartItem.name || cartItem._id} not found` });
      }
      if (dbItem.stock < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${dbItem.name}. Available: ${dbItem.stock}, Requested: ${cartItem.quantity}` 
        });
      }
    }

    // 2. Decrement stock for all items
    const updatedItems = [];
    for (const cartItem of items) {
      const dbItem = await Item.findById(cartItem._id);
      dbItem.stock -= cartItem.quantity;
      if (dbItem.stock === 0) {
        dbItem.reportedOutOfStock = true;
      }
      await dbItem.save();
      updatedItems.push(dbItem);
    }

    res.json({ message: 'Checkout processed successfully', items: updatedItems });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Server error processing checkout' });
  }
});

module.exports = router;
