const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get All Items
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const inventory = await Inventory.find({ user_id: userId }).sort({ item_name: 1 });
        res.json(inventory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add Item
router.post('/', async (req, res) => {
    const userId = req.user.id;
    const { item_name, quantity, unit, cost_price, selling_price } = req.body;

    try {
        const newItem = new Inventory({
            user_id: userId,
            item_name,
            quantity,
            unit,
            cost_price,
            selling_price
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Item
router.put('/:id', async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { item_name, quantity, unit, cost_price, selling_price } = req.body;

    try {
        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: id, user_id: userId },
            { item_name, quantity, unit, cost_price, selling_price },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Item
router.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const deletedItem = await Inventory.findOneAndDelete({ _id: id, user_id: userId });
        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
