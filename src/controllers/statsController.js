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

    const today = new Date();
    today.setHours(0,0,0,0);
    const chartData = [];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // Build 7-day moving window for Chart
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);

        const count = await Coupon.countDocuments({
            issuedAt: { $gte: d, $lt: nextDay }
        });

        chartData.push({
            name: days[d.getDay()],
            value: count
        });
    }

    // Build Recent Activity
    const recentCoupons = await Coupon.find()
        .sort({ issuedAt: -1 })
        .limit(5)
        .populate('partner', 'name description');

    const recentActivity = recentCoupons.map(c => {
        const isRedeemed = c.status === 'Used';
        return {
            id: `#ACT-${c._id.toString().substring(0, 5).toUpperCase()}`,
            business: c.partner ? c.partner.name : 'System Partner',
            category: c.partner ? c.partner.description || 'Business' : 'Platform',
            detail: isRedeemed ? 'Coupon Redeemed' : 'Coupon Issued',
            status: isRedeemed ? 'COMPLETED' : 'ACTIVE',
            date: c.issuedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            iconColor: isRedeemed ? 'bg-emerald-500' : 'bg-blue-500'
        };
    });

    res.json({
        totalCoupons,
        redeemedCoupons,
        totalPartners,
        totalChallenges,
        totalUsers,
        chartData,
        recentActivity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
};
