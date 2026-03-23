const PromoTemplate = require('../models/PromoTemplate');

exports.getAllPromos = async (req, res) => {
  try {
    const promos = await PromoTemplate.find().populate('partner', 'name').sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving promos' });
  }
};

exports.createPromo = async (req, res) => {
  try {
    const { title, description, partnerId, discountType, discountValue, minSpend, validUntil, usageLimit } = req.body;

    if (!title || !partnerId || !discountValue) {
       return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPromo = new PromoTemplate({
      title,
      description,
      partner: partnerId,
      discountType,
      discountValue,
      minSpend,
      validUntil,
      usageLimit
    });

    await newPromo.save();
    
    res.status(201).json({
      message: 'Promo coupon template created successfully!',
      promo: newPromo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating promo' });
  }
};

// PATCH update promo status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const promo = await PromoTemplate.findById(id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });

    promo.status = status;
    await promo.save();
    
    res.json({ message: 'Promo status updated successfully', promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating promo status' });
  }
};

// DELETE a promo
exports.deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await PromoTemplate.findByIdAndDelete(id);
    
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    
    res.json({ message: 'Promo template permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting promo' });
  }
};
