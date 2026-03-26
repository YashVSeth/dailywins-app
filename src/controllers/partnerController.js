const Partner = require('../models/Partner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_dailywins_2024';


// GET all partners (for the dropdown list)
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving partners' });
  }
};

// POST register a new partner
exports.registerPartner = async (req, res) => {
  try {
    const { name, description, location, category, email, registrationNo, phoneNumber, username, password } = req.body;

    if (!name || !phoneNumber || !email) {
       return res.status(400).json({ message: 'Missing required configuration fields' });
    }

    // Check if email is taken
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
        return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password securely if provided
    let hashedPassword = null;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    const newPartner = new Partner({
      name,
      description,
      location,
      category,
      email,
      registrationNo,
      phoneNumber,
      username,
      password: hashedPassword
    });

    await newPartner.save();
    
    res.status(201).json({
      message: 'Partner registered successfully!',
      partner: newPartner
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error registering partner' });
  }
};

// POST login a partner
exports.loginPartner = async (req, res) => {
  try {
    const { username, password } = req.body;

    const partner = await Partner.findOne({ username });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: partner._id, role: 'partner' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      partner: {
         id: partner._id,
         name: partner.name,
         username: partner.username,
         status: partner.status
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error logging in' });
  }
};

// PATCH update partner status (Activate/Deactivate)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, username, password } = req.body;

    const partner = await Partner.findById(id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });

    partner.status = status;

    if (username) partner.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      partner.password = await bcrypt.hash(password, salt);
    }
    
    await partner.save();
    res.json({ message: 'Partner status updated successfully', partner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating partner status' });
  }
};

// DELETE a partner
exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findByIdAndDelete(id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json({ message: 'Partner business permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting partner' });
  }
};
