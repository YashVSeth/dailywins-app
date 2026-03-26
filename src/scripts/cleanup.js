const cron = require('node-cron');
const Challenge = require('../models/Challenge');
const Coupon = require('../models/Coupon');

// Run every night at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 [CRON] Starting nightly cleanup job...');
  try {
    const now = new Date();
    
    // 1. Find all active challenges
    const activeChallenges = await Challenge.find({ isActive: true });
    
    let expiredChallengeIds = [];
    
    // 2. Determine which ones have expired based on durationDays
    for (const challenge of activeChallenges) {
        if (!challenge.durationDays) continue; // If no duration, it lasts forever

        const expirationDate = new Date(challenge.createdAt);
        expirationDate.setDate(expirationDate.getDate() + challenge.durationDays);

        if (now > expirationDate) {
            expiredChallengeIds.push(challenge._id);
            challenge.isActive = false;
            await challenge.save();
            console.log(`[CRON] Expired Challenge: ${challenge.title} (${challenge._id})`);
        }
    }

    // 3. Find all unredeemed coupons associated with those expired challenges and expire them
    if (expiredChallengeIds.length > 0) {
        const couponResult = await Coupon.updateMany(
            { challenge: { $in: expiredChallengeIds }, status: 'Active' },
            { $set: { status: 'Expired' } }
        );
        console.log(`[CRON] Expired ${couponResult.modifiedCount} unused coupons linked to expired challenges.`);
    } else {
        console.log('[CRON] No challenges expired today.');
    }

    console.log('✅ [CRON] Nightly cleanup job finished successfully.');
  } catch (error) {
    console.error('❌ [CRON] Error during nightly cleanup:', error);
  }
});
