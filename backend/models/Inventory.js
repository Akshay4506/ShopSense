const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item_name: { type: String, required: true },
    cost_price: { type: Number, required: true },
    selling_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    low_stock_threshold: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' }
});

module.exports = mongoose.model('Inventory', inventorySchema);
