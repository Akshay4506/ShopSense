const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Bill = require('../models/Bill');

router.get('/', async (req, res) => {
    const userId = req.user.id;
    const notifications = [];

    try {
        // 1. Check Low Stock (Threshold: 5)
        const lowStockItems = await Inventory.find({
            user_id: userId,
            quantity: { $lte: 5 }
        });

        lowStockItems.forEach(item => {
            notifications.push({
                type: 'low_stock',
                message: `Low Stock: ${item.item_name} is running low (${item.quantity} ${item.unit} left).`,
                severity: 'warning'
            });
        });

        // 2. Check Profit Margin (Simple Heuristic on recent bills)
        // Get total sales and cost for current month
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const profitAgg = await Bill.aggregate([
            {
                $match: {
                    user_id: new require('mongoose').Types.ObjectId(userId),
                    created_at: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total_amount" },
                    cost: { $sum: "$total_cost" }
                }
            }
        ]);

        const revenue = profitAgg.length > 0 ? profitAgg[0].revenue : 0;
        const cost = profitAgg.length > 0 ? profitAgg[0].cost : 0;

        if (revenue && cost) {
            const margin = revenue - cost;
            const percentage = (margin / revenue) * 100;

            if (percentage < 10) {
                notifications.push({
                    type: 'low_profit',
                    message: `Low Profit Margin: Your margin is only ${percentage.toFixed(1)}% this month.`,
                    severity: 'alert'
                });
            } else if (margin < 0) {
                notifications.push({
                    type: 'loss',
                    message: `Loss Warning: You are operating at a loss this month.`,
                    severity: 'critical'
                });
            }
        }

        res.json(notifications);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
