const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Inventory = require('../models/Inventory');

// Create Bill
router.post('/', async (req, res) => {
    const userId = req.user.id;
    const { items, total_amount, total_cost } = req.body; // items: [{ item_name, quantity, selling_price, cost_price, inventory_id (optional), unit }]

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in bill' });
    }

    try {
        // Generate a simple sequential bill_number
        const lastBill = await Bill.findOne({ user_id: userId }).sort({ bill_number: -1 });
        const billNumber = lastBill && lastBill.bill_number ? lastBill.bill_number + 1 : 1;

        // Create Bill document
        const newBill = new Bill({
            user_id: userId,
            bill_number: billNumber,
            total_amount,
            total_cost,
            items: items.map(item => ({
                inventory_id: item.inventory_id || null,
                item_name: item.item_name,
                quantity: item.quantity,
                unit: item.unit,
                cost_price: item.cost_price,
                selling_price: item.selling_price
            }))
        });

        await newBill.save();

        // Decrement inventory if linked
        for (const item of items) {
            if (item.inventory_id && item.inventory_id !== 'null') {
                await Inventory.findOneAndUpdate(
                    { _id: item.inventory_id, user_id: userId },
                    { $inc: { quantity: -item.quantity } }
                );
            }
        }

        res.status(201).json(newBill);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const bills = await Bill.find({ user_id: userId }).sort({ created_at: -1 });
        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Bill Details (with items)
router.get('/:id', async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const bill = await Bill.findOne({ _id: id, user_id: userId });

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        res.json(bill);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
