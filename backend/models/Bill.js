const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    inventory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', default: null },
    item_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    cost_price: { type: Number, required: true },
    selling_price: { type: Number, required: true }
}, { _id: false });

const billSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bill_number: { type: Number, required: true },
    customer_name: { type: String, default: null },
    customer_phone: { type: String, default: null },
    total_amount: { type: Number, required: true },
    total_cost: { type: Number, required: true }, // Needed for profit calculations
    items: [billItemSchema]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Bill', billSchema);
