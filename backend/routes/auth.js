const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email Transporter (Configure with your credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Register
router.post('/register', async (req, res) => {
    const { email, password, shopkeeper_name, shop_name, address, phone } = req.body;

    try {
        // Check if user exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = new User({
            email,
            password: hashedPassword,
            shopkeeper_name,
            shop_name,
            shop_address: address, // address comes from req.body
            phone
        });
        await newUser.save();

        // Generate Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: newUser._id, email: newUser.email, shopkeeper_name: newUser.shopkeeper_name } });

    } catch (error) {
        console.error("DEBUG REG ERROR:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

// Login (Password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, email: user.email, shopkeeper_name: user.shopkeeper_name } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send Mobile OTP (Login Verification)
router.post('/send-mobile-otp', async (req, res) => {
    const { phone } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            // Security: Don't reveal if user exists, but return explicit message for UX
            return res.json({ message: 'If the mobile number exists, a login code has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otp_expires_at = expiresAt;
        await user.save();

        // Print OTP internally for development testing since no SMS API is present
        console.log(`[DEV ONLY] Mobile OTP for ${phone}: ${otp}`);

        res.json({ message: 'Login code sent to your mobile device.' });

    } catch (error) {
        console.error("Mobile OTP Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Login with Mobile OTP
router.post('/login-with-mobile-otp', async (req, res) => {
    const { phone, otp } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Check if OTP matches
        if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ error: 'Invalid Code' });
        }

        // Check verification (expiry)
        const now = new Date();
        const expires = new Date(user.otp_expires_at);

        if (now > expires) {
            return res.status(400).json({ error: 'Code expired' });
        }

        // Clear OTP
        user.otp = null;
        user.otp_expires_at = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email, shopkeeper_name: user.shopkeeper_name, phone: user.phone } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Password (Authenticated)
router.put('/update-password', require('../middleware/auth'), async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // From auth middleware

    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
