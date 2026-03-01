const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get Profile
// Get Profile
router.get('/', async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            shopkeeper_name: user.shopkeeper_name,
            shop_name: user.shop_name,
            address: user.shop_address,
            phone_number: user.phone
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Profile
router.put('/', async (req, res) => {
    const userId = req.user.id;
    const { shopkeeper_name, shop_name, address, phone_number } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            shopkeeper_name,
            shop_name,
            shop_address: address,
            phone: phone_number
        }, { new: true });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            shopkeeper_name: user.shopkeeper_name,
            shop_name: user.shop_name,
            address: user.shop_address,
            phone_number: user.phone
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
