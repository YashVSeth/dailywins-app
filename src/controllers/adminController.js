const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_dailywins_2024';


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

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin Login successful',
      token,
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

// PATCH update admin password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id; // from requireAdmin middleware

    // We only support the single seeded root admin for now, but look up by ID for safety
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error.message);
    res.status(500).json({ message: 'Server error updating password' });
  }
};
