const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  category: { type: String },
  email: { type: String, required: true, unique: true },
  registrationNo: { type: String },
  phoneNumber: { type: String, required: true },
  username: { type: String },
  password: { type: String },
  status: { type: String, enum: ['ACTIVE', 'PENDING', 'INACTIVE'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', partnerSchema);
