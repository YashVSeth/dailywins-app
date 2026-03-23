const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: { type: String, required: true, unique: true }, // The secure UUID
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  challengeDescription: { type: String }, 
  status: { type: String, enum: ['Valid', 'Used'], default: 'Valid' },
  issuedAt: { type: Date, default: Date.now },
  redeemedAt: { type: Date }
});

module.exports = mongoose.model('Coupon', couponSchema);
