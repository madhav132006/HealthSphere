const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  status: { type: String, enum: ['active', 'expired', 'closed'], default: 'active' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
