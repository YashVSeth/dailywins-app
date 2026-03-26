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

// Generate downloadable CSV report
exports.generateReport = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('user', 'phoneNumber name')
      .populate('partner', 'name')
      .populate('challenge', 'title')
      .sort({ issuedAt: -1 });

    const partners = await Partner.find().select('name status createdAt');
    const challenges = await Challenge.find().select('title durationDays isActive createdAt');

    // Build CSV
    const lines = [];

    // Section 1: Coupons
    lines.push('=== COUPON REPORT ===');
    lines.push('Coupon Code,User Phone,User Name,Partner,Challenge,Status,Issued At,Redeemed At');
    coupons.forEach(c => {
      const row = [
        c.couponCode,
        c.user?.phoneNumber || 'N/A',
        c.user?.name || 'N/A',
        c.partner?.name || 'N/A',
        c.challenge?.title || c.challengeDescription || 'N/A',
        c.status,
        c.issuedAt ? c.issuedAt.toISOString() : '',
        c.redeemedAt ? c.redeemedAt.toISOString() : ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(','));
    });

    lines.push('');
    lines.push('=== PARTNERS ===');
    lines.push('Name,Status,Created At');
    partners.forEach(p => {
      lines.push(`"${p.name}","${p.status}","${p.createdAt ? p.createdAt.toISOString() : ''}"`);
    });

    lines.push('');
    lines.push('=== CHALLENGES ===');
    lines.push('Title,Duration (Days),Active,Created At');
    challenges.forEach(ch => {
      lines.push(`"${ch.title}","${ch.durationDays}","${ch.isActive !== false ? 'Yes' : 'No'}","${ch.createdAt ? ch.createdAt.toISOString() : ''}"`);
    });

    const csv = lines.join('\n');
    const now = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=DailyWins_Report_${now}.csv`);
    res.send(csv);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating report' });
  }
};
