const mongoose = require('mongoose');

const promoTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'FREE_ITEM'], default: 'PERCENTAGE' },
  discountValue: { type: Number, required: true },
  minSpend: { type: Number, default: 0 },
  validUntil: { type: Date },
  usageLimit: { type: Number },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'EXPIRED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PromoTemplate', promoTemplateSchema);
