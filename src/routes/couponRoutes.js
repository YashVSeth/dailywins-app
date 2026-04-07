const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { requireAdmin, requirePartner } = require('../middleware/authMiddleware');

// 1. Generate new coupon (Admin)
router.post('/generate', requireAdmin, couponController.generateCoupon);

// 2. Check coupon status (Optional/Info)
router.get('/status/:code', couponController.checkStatus);

// 3. Redeem coupon (Partner Scanner)
router.post('/redeem', requirePartner, couponController.redeemCoupon);

router.get('/all', requireAdmin, couponController.getAllCoupons);
router.get('/today', requireAdmin, couponController.getTodaysCoupons);
router.get('/:id', couponController.getCouponById);

module.exports = router;
