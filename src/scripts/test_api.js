const mongoose = require('mongoose');
const User = require('../models/User');
const Partner = require('../models/Partner');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/local-rewards';

const runTests = async () => {
    try {
        await mongoose.connect(URI);
        const user = await User.findOne();
        const partner = await Partner.findOne();

        if (!user || !partner) {
            console.error('Please run the seed script first.');
            process.exit(1);
        }

        console.log('--- TESTING GENERATION ---');
        const genRes = await fetch('http://localhost:5000/api/coupons/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user._id,
                partnerId: partner._id,
                challengeDescription: 'Run 2km today'
            })
        });
        
        const textData = await genRes.text();
        console.log('Raw response:', textData);
        let genData;
        try {
            genData = JSON.parse(textData);
        } catch (err) {
            console.error('JSON Parse error', err);
            throw new Error('Not JSON');
        }

        const couponId = genData.couponId;
        console.log(`\nGenerated Coupon DB ID: ${couponId}\n`);
        
        // Let's get the actual coupon from DB to find the secure code
        // The API currently doesn't return the raw code, it returns the base64 image
        // To test redemption, we need the raw code that normally would be inside the QR
        const Coupon = require('../models/Coupon');
        const couponDoc = await Coupon.findById(couponId);
        const secureCode = couponDoc.couponCode;

        console.log('--- TESTING 1st REDEMPTION (Should Succeed) ---');
        const redeemRes1 = await fetch('http://localhost:5000/api/coupons/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: secureCode })
        });
        const redeemData1 = await redeemRes1.json();
        console.log(redeemData1);

        console.log('\n--- TESTING 2nd REDEMPTION (Should Fail) ---');
        const redeemRes2 = await fetch('http://localhost:5000/api/coupons/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: secureCode })
        });
        const redeemData2 = await redeemRes2.json();
        console.log(redeemData2);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

runTests();
