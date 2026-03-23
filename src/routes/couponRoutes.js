const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// 1. Generate new coupon (Admin)
router.post('/generate', couponController.generateCoupon);

// 2. Check coupon status (Optional/Info)
router.get('/status/:code', couponController.checkStatus);

// 3. Redeem coupon (Partner Scanner)
router.post('/redeem', couponController.redeemCoupon);

// 4. Fetch specific coupon (Public Link for WhatsApp)
router.get('/:id', couponController.getCouponById);

module.exports = router;
