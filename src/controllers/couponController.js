const crypto = require('crypto');
const QRCode = require('qrcode');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Challenge = require('../models/Challenge');

// Helper to generate a secure random code
const generateSecureCode = () => crypto.randomBytes(16).toString('hex');

// 1. Generate a new QR code coupon (Admin action)
exports.generateCoupon = async (req, res) => {
  try {
    const { phoneNumber, challengeId } = req.body;

    if (!phoneNumber || !challengeId) {
      return res.status(400).json({ message: 'Phone number and challenge are required' });
    }

    // Look up the challenge to auto-resolve partner
    const challenge = await Challenge.findById(challengeId).populate('partner');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Validate the Challenge has not expired
    if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Error: Cannot issue a reward for an expired challenge.' });
    }

    const partnerId = challenge.partner._id;

    // Find user by phone number, or create them on the fly if they are new
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ 
         phoneNumber,
         name: 'Community Member'
      });
      await user.save();
    }

    const couponCode = generateSecureCode();

    const newCoupon = new Coupon({
      couponCode,
      user: user._id,
      partner: partnerId,
      challenge: challengeId,
      challengeDescription: challenge.title
    });

    await newCoupon.save();

    // Generate the actual QR code image (base64 string)
    const qrDataUrl = await QRCode.toDataURL(couponCode);

    res.status(201).json({
      message: 'Coupon generated successfully',
      couponId: newCoupon._id,
      qrCodeDataUrl: qrDataUrl
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating coupon' });
  }
};

// 2. Check Coupon Status (Optional, maybe for user UI)
exports.checkStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ couponCode: code }).populate('partner');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({
      status: coupon.status,
      partner: coupon.partner.name,
      phone: coupon.partner.phoneNumber,
      issuedAt: coupon.issuedAt,
      redeemedAt: coupon.redeemedAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error checking status' });
  }
};

// Public endpoint to fetch a specific coupon by ID to render on the generated web link
exports.getCouponById = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId)
        .populate('user', 'name phoneNumber')
        .populate('partner', 'name phoneNumber location description');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Always regenerate the QR code using the exact coupon code the scanner expects
    const qrCodeDataUrl = await QRCode.toDataURL(coupon.couponCode);

    res.json({
        coupon,
        qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Server error fetching coupon' });
  }
};


// 3. Redeem Coupon (Partner Scanner action) - THE MAGIC FEATURE
exports.redeemCoupon = async (req, res) => {
  try {
    const { code, partnerId } = req.body;

    // First, find the coupon to validate the partner
    const couponCheck = await Coupon.findOne({ couponCode: code });

    if (!couponCheck) {
      return res.status(404).json({ success: false, message: 'Invalid QR Code' });
    }

    // Validate that the scanning partner matches the coupon's designated partner
    if (partnerId && couponCheck.partner.toString() !== partnerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'This QR code is not valid at this location' 
      });
    }

    if (couponCheck.status === 'Used') {
      return res.status(400).json({ 
        success: false, 
        message: 'ALREADY USED', 
        redeemedAt: couponCheck.redeemedAt 
      });
    }

    // Atomically mark as used
    const coupon = await Coupon.findOneAndUpdate(
      { couponCode: code, status: 'Valid' },
      { 
        $set: { 
          status: 'Used',
          redeemedAt: new Date()
        }
      },
      { new: true }
    ).populate('user');

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Could not redeem coupon' });
    }

    // Success!
    res.json({
      success: true,
      message: 'VALID: Discount Approved!',
      user: coupon.user.name,
      redeemedAt: coupon.redeemedAt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error redeeming coupon' });
  }
};

// 4. Get today's generated coupons (Admin Rewards list)
exports.getTodaysCoupons = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const coupons = await Coupon.find({
      issuedAt: { $gte: today, $lt: tomorrow }
    })
      .populate('user', 'phoneNumber name')
      .populate('partner', 'name')
      .populate('challenge', 'title')
      .sort({ issuedAt: -1 });

    const result = coupons.map(c => ({
      _id: c._id,
      phoneNumber: c.user?.phoneNumber || 'N/A',
      userName: c.user?.name || 'N/A',
      partner: c.partner?.name || 'N/A',
      challenge: c.challenge?.title || c.challengeDescription || 'N/A',
      status: c.status,
      issuedAt: c.issuedAt,
      redeemedAt: c.redeemedAt
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching today\'s coupons' });
  }
};
