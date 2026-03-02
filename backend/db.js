const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsense-dukaan';

mongoose.connect(MONGODB_URI)
    .then(() => {
        // Only log a partial masked URI for safety in production
        const maskedUri = MONGODB_URI.replace(/\/\/.*@/, "//****:****@");
        console.log("Successfully connected to MongoDB:", maskedUri);
    })
    .catch((err) => {
        console.error("CRITICAL ERROR: Failed to connect to MongoDB. Check your MONGODB_URI and Atlas IP Whitelist.");
        console.error("Error details:", err.message);
        process.exit(1);
    });

module.exports = mongoose;
