const express = require('express');
const router = express.Router();
const DailySession = require('../models/DailySession');
const Bill = require('../models/Bill');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// Get active session
router.get('/active', auth, async (req, res) => {
    try {
        const session = await DailySession.findOne({
            user_id: req.user.id,
            status: 'active'
        });
        res.json(session || null);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get bills for current active session
router.get('/today-bills', auth, async (req, res) => {
    try {
        const { startTime } = req.query;
        if (!startTime) return res.json([]);

        const bills = await Bill.find({
            user_id: req.user.id,
            created_at: { $gte: new Date(startTime) }
        }).select('total_amount total_cost created_at');
        res.json(bills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get past sessions
router.get('/past', auth, async (req, res) => {
    try {
        const sessions = await DailySession.find({
            user_id: req.user.id,
            status: 'closed'
        }).sort({ end_time: -1 }).limit(7);
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Start Day
router.post('/start', auth, async (req, res) => {
    try {
        // Check if already active
        const active = await DailySession.findOne({
            user_id: req.user.id,
            status: 'active'
        });

        if (active) {
            return res.status(400).json({ message: 'Day already started' });
        }

        const newSession = new DailySession({
            user_id: req.user.id,
            status: 'active'
        });
        await newSession.save();

        res.json(newSession);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// End Day
router.put('/end', auth, async (req, res) => {
    try {
        const { id, total_sales, total_cost } = req.body;

        const session = await DailySession.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            {
                status: 'closed',
                end_time: new Date(),
                total_sales,
                total_cost
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: 'Session not found or unauthorized' });
        }

        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
