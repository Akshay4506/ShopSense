const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const auth = require('../middleware/auth');

// Get all bills for analytics (simplified for now, ideally should use specific queries)
router.get('/bills', auth, async (req, res) => {
    try {
        const bills = await Bill.find({ user_id: req.user.id })
            .select('_id total_amount total_cost created_at')
            .sort({ created_at: -1 });

        // Transform _id to id for backwards compatibility if needed
        const result = bills.map(b => ({
            id: b._id,
            total_amount: b.total_amount,
            total_cost: b.total_cost,
            created_at: b.created_at
        }));

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Top Sellers
router.get('/top-sellers', auth, async (req, res) => {
    try {
        // Use MongoDB aggregation to calculate top sellers by revenue
        const result = await Bill.aggregate([
            { $match: { user_id: new require('mongoose').Types.ObjectId(req.user.id) } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.item_name",
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.selling_price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    item_name: "$_id",
                    quantity: 1,
                    revenue: 1
                }
            }
        ]);

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GST Data / Monthly Stats
// This can be calculated on frontend from /bills or done here. 
// Let's stick to /bills for raw data to match frontend logic for now, or add specific aggregation if needed.

module.exports = router;
