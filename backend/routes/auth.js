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

// Send Login OTP (Passwordless & Login Verification)
router.post('/send-login-otp', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal if user exists, but we return explicit message for UX as requested
            return res.json({ message: 'If the email exists, a login code has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otp_expires_at = expiresAt;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ShopSense Login Code',
            text: `Your login verification code is: ${otp}. It expires in 10 minutes.`
        };

        console.log(`[DEV ONLY] Login OTP for ${email}: ${otp}`);

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail(mailOptions);
            } catch (emailErr) {
                console.error("Failed to send login email (Dev Mode - continuing):", emailErr.message);
            }
        }

        res.json({ message: 'Login code sent to your email.' });

    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Login with OTP
router.post('/login-with-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Check if OTP matches
        // Convert both to strings to ensure type safety
        if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
            console.log(`[DEBUG] OTP Mismatch. Input: '${otp}', Stored: '${user.otp}'`);
            return res.status(400).json({ error: 'Invalid Code' });
        }

        // Check verification (expiry)
        const now = new Date();
        const expires = new Date(user.otp_expires_at);

        console.log(`[DEBUG] OTP Expiry Check. Now: ${now}, Expires: ${expires}`);

        if (now > expires) {
            return res.status(400).json({ error: 'Code expired' });
        }

        console.log(`[DEV ONLY] Login Successful for ${email}`);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email: user.email, shopkeeper_name: user.shopkeeper_name } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log(`[DEBUG] Forgot Password request for: ${email}`);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[DEBUG] User not found: ${email}`);
            return res.json({ message: 'If the email exists, an OTP has been sent.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        user.otp = otp;
        user.otp_expires_at = expiresAt;
        await user.save();
        console.log(`[DEBUG] OTP stored in DB for ${email}`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ShopSense Password Reset OTP',
            text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`
        };

        console.log(`[DEV ONLY] Reset OTP for ${email}: ${otp}`);

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`[DEBUG] Email sent successfully to ${email}`);
            } catch (emailErr) {
                console.error("Failed to send reset email (Dev Mode - continuing):", emailErr.message);
            }
        } else {
            console.log(`[DEBUG] Email credentials missing, skipping sendMail`);
        }

        res.json({ message: 'If the email exists, an OTP has been sent.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Reset Password - Verify OTP and Reset
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // OTP Validation
        if (!user.otp || String(user.otp).trim() !== String(otp).trim()) {
            console.log(`[DEBUG] Reset OTP Mismatch. Input: '${otp}', Stored: '${user.otp}'`);
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        const now = new Date();
        const expires = new Date(user.otp_expires_at);

        if (now > expires) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = null;
        user.otp_expires_at = null;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now login.' });

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
