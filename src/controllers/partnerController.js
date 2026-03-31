const Partner = require('../models/Partner');
const Challenge = require('../models/Challenge');
const Coupon = require('../models/Coupon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_dailywins_2024';


// GET all partners (for the dropdown list)
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving partners' });
  }
};

// POST register a new partner
exports.registerPartner = async (req, res) => {
  try {
    const { name, description, location, category, email, registrationNo, phoneNumber, username, password } = req.body;

    if (!name || !phoneNumber || !email) {
       return res.status(400).json({ message: 'Missing required configuration fields' });
    }

    // Check if email is taken
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
        return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password securely if provided
    let hashedPassword = null;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const newPartner = new Partner({
      name,
      description,
      location,
      category,
      email,
      registrationNo,
      phoneNumber,
      username,
      password: hashedPassword
    });

    await newPartner.save();
    
    res.status(201).json({
      message: 'Partner registered successfully!',
      partner: newPartner
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error registering partner' });
  }
};

// POST login a partner
exports.loginPartner = async (req, res) => {
  try {
    const { username, password } = req.body;

    const partner = await Partner.findOne({ username });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: partner._id, role: 'partner' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      partner: {
         id: partner._id,
         name: partner.name,
         username: partner.username,
         status: partner.status
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error logging in' });
  }
};

// PATCH update partner status (Activate/Deactivate)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, username, password } = req.body;

    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    partner.status = status;

    if (username) partner.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      partner.password = await bcrypt.hash(password, salt);
    }
    
    await partner.save();
    res.json({ message: 'Partner status updated successfully', partner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating partner status' });
  }
};

// DELETE a partner
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findByIdAndDelete(id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json({ message: 'Partner business permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting partner' });
  }
};

// GET partner stats (for the Partner Dashboard)
exports.getPartnerStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: make sure the requester is viewing their own stats (if we trust the JWT middleware it's safe)

    // 1. Get Active Challenges for this partner
    const activeChallenges = await Challenge.countDocuments({
      partner: id,
      isActive: true
    });

    // 2. Get today's coupon scans
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysScans = await Coupon.countDocuments({
      partner: id,
      status: 'Used',
      redeemedAt: { $gte: startOfDay }
    });

    // 3. Get total lifetime scans
    const totalScans = await Coupon.countDocuments({
      partner: id,
      status: 'Used'
    });

    // 4. Get 5 most recent scans
    const recentScans = await Coupon.find({ partner: id, status: 'Used' })
      .populate('user', 'phoneNumber name')
      .populate('challenge', 'title')
      .sort({ redeemedAt: -1 })
      .limit(5);

    // 5. Build 30-day active tracking window via Aggregation for this specific partner
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const aggResult = await Coupon.aggregate([
        { $match: { partner: new mongoose.Types.ObjectId(id), issuedAt: { $gte: thirtyDaysAgo } } },
        { $group: {
             _id: { $dateToString: { format: "%Y-%m-%d", date: "$issuedAt" } },
             issued: { $sum: 1 },
             redeemed: { $sum: { $cond: [{ $eq: ["$status", "Used"] }, 1, 0] } }
        }},
        { $sort: { _id: 1 } }
    ]);

    const daysMap = new Map();
    aggResult.forEach(item => daysMap.set(item._id, item));

    const chartData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dataObj = daysMap.get(dateStr) || { issued: 0, redeemed: 0 };
        
        chartData.push({
            name: `${months[d.getMonth()]} ${d.getDate()}`,
            issued: dataObj.issued,
            redeemed: dataObj.redeemed
        });
    }

    res.json({
      activeChallenges,
      todaysScans,
      totalScans,
      recentScans,
      chartData
    });

  } catch (error) {
    console.error('Error fetching partner stats:', error);
    res.status(500).json({ message: 'Server error fetching partner stats' });
  }
};
