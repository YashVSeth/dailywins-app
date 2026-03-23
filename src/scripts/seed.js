require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Partner = require('../models/Partner');
const Challenge = require('../models/Challenge');
const Coupon = require('../models/Coupon');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/local-rewards';

mongoose.connect(URI);

const seedDatabase = async () => {
  try {
    console.log('Clearing database...');
    // In dev, sometimes we want to start fresh to test the redeeming flow again safely.
    await User.deleteMany();
    await Partner.deleteMany();
    await Challenge.deleteMany();
    await Coupon.deleteMany();

    console.log('Creating seed users...');
    const user1 = await new User({ phoneNumber: '+15550001111', name: 'Alice Walker' }).save();
    const user2 = await new User({ phoneNumber: '+15550002222', name: 'Bob Fitness' }).save();

    console.log('Creating seed challenges...');
    const challenge1 = await new Challenge({
       title: 'Morning 5K Run',
       description: 'Complete a 5km run before 10 AM.',
       targetMetric: '5km'
    }).save();
    
    const challenge2 = await new Challenge({
       title: 'Healthy Hydration',
       description: 'Drink 2 liters of water today.',
       targetMetric: '2L'
    }).save();

    console.log('Creating seed partners...');
    const partner1 = await new Partner({
      name: 'Local Coffee Roasters',
      description: 'The best espresso in town.',
      location: '123 Main St.',
      discountOffer: '50% off any large drink'
    }).save();

    const partner2 = await new Partner({
       name: 'Juice Bar Central',
       description: 'Fresh pressed organic juices.',
       location: '456 Oak Avenue',
       discountOffer: 'Buy 1 Get 1 Free Smoothies'
     }).save();

    console.log('Seed completed successfully!');
    console.log(`\n--- USE THESE IDs FOR TESTING GENERATION ---`);
    console.log(`User ID (Alice): ${user1._id}`);
    console.log(`Partner ID (Coffee): ${partner1._id}`);
    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
