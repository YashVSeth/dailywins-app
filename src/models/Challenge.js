const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  category: { type: String, enum: ['PURCHASE', 'SOCIAL', 'REFERRAL', 'LOCATION', 'MILESTONE', 'ENGAGEMENT', 'SALES'], default: 'ENGAGEMENT' },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'], default: 'MEDIUM' },
  targetMetric: { type: String }, // e.g., "5km", "10,000 steps"
  durationDays: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  rewardPromoId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoTemplate' },
  pointsAwarded: { type: Number, default: 0 },
  badgeType: { type: String, default: 'none' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);
