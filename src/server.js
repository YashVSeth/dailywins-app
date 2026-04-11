require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Origin Check:', origin);
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamified-marketing')
.then(() => {
    console.log('Connected to MongoDB: gamified-marketing');
    const adminController = require('./controllers/adminController');
    adminController.seedDefaultAdmin();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes 
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);

const promoRoutes = require('./routes/promoRoutes');
app.use('/api/promos', promoRoutes);

const partnerRoutes = require('./routes/partnerRoutes');
app.use('/api/partners', partnerRoutes);

const challengeRoutes = require('./routes/challengeRoutes');
app.use('/api/challenges', challengeRoutes);

const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

// Start Cron Jobs
require('./scripts/cleanup');
require('./scripts/keepAlive');

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
