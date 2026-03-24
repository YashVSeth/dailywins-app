const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Auto-seed default admin if none exist
exports.seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const defaultAdmin = new Admin({
        username: 'admin',
        password: hashedPassword
      });
      
      await defaultAdmin.save();
      console.log('Seeded default Admin: (Username: admin, Password: admin123)');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

// POST login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid Admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin credentials' });
    }

    res.json({
      message: 'Admin Login successful',
      admin: {
         id: admin._id,
         username: admin.username
      }
    });

  } catch (error) {
    console.error('Admin login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error logging in: ' + error.message });
  }
};
