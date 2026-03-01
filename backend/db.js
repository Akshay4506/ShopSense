const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsense-dukaan';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Successfully connected to MongoDB:", MONGODB_URI);
    })
    .catch((err) => {
        console.error("CRITICAL ERROR: Failed to connect to MongoDB", err);
        process.exit(1);
    });

module.exports = mongoose;
