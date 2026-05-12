const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  fee: { type: Number, required: true },
  avatar: { type: String, default: '' },
  available: { type: Boolean, default: true },
  bio: { type: String, default: '' },
  languages: [{ type: String }],
  nextAvailable: { type: String, default: '10 min' },
  consultations: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
