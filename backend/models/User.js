const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    shopkeeper_name: { type: String, required: true },
    shop_name: { type: String, default: '' },
    shop_address: { type: String, default: '' },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema);
