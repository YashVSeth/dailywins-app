const Coupon = require('../models/Coupon');
const Partner = require('../models/Partner');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const redeemedCoupons = await Coupon.countDocuments({ status: 'Used' });
    const totalPartners = await Partner.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
        totalCoupons,
        redeemedCoupons,
        totalPartners,
        totalChallenges,
        totalUsers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
};
