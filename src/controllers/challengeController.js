const Challenge = require('../models/Challenge');

// GET all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const rawChallenges = await Challenge.find()
      .populate('partner', 'name')
      .populate('rewardPromoId', 'title discountType discountValue')
      .sort({ createdAt: -1 });
    
    // Map active status dynamically
    const challenges = rawChallenges.map(c => {
      const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
      return {
        ...c.toObject(),
        isActive: !isExpired
      };
    });

    res.json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving challenges' });
  }
};

// POST register a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const { title, description, category, difficulty, targetMetric, durationDays, rewardPromoId, pointsAwarded, badgeType, partnerId } = req.body;

    if (!title || !description || !durationDays || !partnerId) {
       return res.status(400).json({ message: 'Missing required configuration fields (title, description, durationDays, partnerId)' });
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays));

    const newChallenge = new Challenge({
      title,
      description,
      partner: partnerId,
      category,
      difficulty,
      targetMetric,
      durationDays,
      expiresAt,
      rewardPromoId,
      pointsAwarded,
      badgeType
    });

    await newChallenge.save();
    
    res.status(201).json({
      message: 'Challenge created successfully!',
      challenge: newChallenge
    });

  } catch (error) {
    console.error('Challenge creation error:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        console.error(`  Field "${field}":`, error.errors[field].message);
      });
    }
    res.status(500).json({ message: 'Server error creating challenge: ' + error.message });
  }
};

// DELETE a challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting challenge' });
  }
};
