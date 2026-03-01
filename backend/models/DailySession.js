const mongoose = require('mongoose');

const dailySessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    start_time: { type: Date, default: Date.now },
    end_time: { type: Date, default: null },
    total_sales: { type: Number, default: 0 },
    total_cost: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('DailySession', dailySessionSchema);
