const jwt = require('jsonwebtoken');

const { normalizeFlexibleDobToIsoDate, normalizeString } = require('../utils/test.utils');

const resolveAdminCredentials = () => {
  const adminPhone =
    normalizeString(process.env.ADMIN_PHONE_NUMBER) ||
    normalizeString(process.env.ADMIN_PHONE) ||
    normalizeString(process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER);

  const adminDobInput = normalizeString(process.env.ADMIN_DOB) || normalizeString(process.env.NEXT_PUBLIC_ADMIN_DOB);
  const adminDob = normalizeFlexibleDobToIsoDate(adminDobInput);

  if (!adminPhone || !adminDob) {
    return null;
  }

  return {
    phone: adminPhone,
    dob: adminDob,
  };
};

const loginAdmin = async (req, res, next) => {
  try {
    const { phone, dob } = req.body;

    if (!phone || !dob) {
      return res.status(400).json({ message: 'phone and dob are required' });
    }

    const credentials = resolveAdminCredentials();

    if (!credentials) {
      return res.status(500).json({ message: 'Admin credentials are not configured' });
    }

    const normalizedPhone = normalizeString(phone);
    const normalizedDob = normalizeFlexibleDobToIsoDate(dob);

    if (!normalizedDob) {
      return res.status(400).json({ message: 'dob must be a valid date in YYYY-MM-DD or DD-MM-YYYY format' });
    }

    if (normalizedPhone !== credentials.phone || normalizedDob !== credentials.dob) {
      return res.status(401).json({ message: 'Invalid admin phone or dob' });
    }

    const token = jwt.sign(
      {
        sub: 'admin',
        role: 'admin',
        phone: credentials.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      role: 'admin',
      admin: {
        phone: credentials.phone,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginAdmin,
};
