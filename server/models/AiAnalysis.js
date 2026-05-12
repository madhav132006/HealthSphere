const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  symptoms: { type: String, required: true },
  age: { type: String },
  gender: { type: String },
  duration: { type: String },
  result: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AiAnalysis', aiAnalysisSchema);
