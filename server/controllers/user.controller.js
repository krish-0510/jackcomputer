const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const DOB_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;
const ALLOWED_GENDERS = new Set(['male', 'female', 'other']);

const parseDobToUtcDate = (dobInput) => {
  if (typeof dobInput !== 'string') {
    return null;
  }

  const trimmedDob = dobInput.trim();
  const match = trimmedDob.match(DOB_REGEX);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      phone: user.phone,
      role: 'user',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  dob: user.dob,
  gender: user.gender,
});

const registerUser = async (req, res, next) => {
  try {
    const { name, phone, email, dob, gender } = req.body;

    if (!name || !phone || !email || !dob || !gender) {
      return res.status(400).json({
        message: 'name, phone, email, dob, and gender are all required',
      });
    }

    const normalizedPhone = String(phone).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedGender = String(gender).trim().toLowerCase();
    const parsedDob = parseDobToUtcDate(String(dob));

    if (!E164_PHONE_REGEX.test(normalizedPhone)) {
      return res.status(400).json({
        message: 'phone must be a valid E.164 format',
      });
    }

    if (!parsedDob) {
      return res.status(400).json({
        message: 'dob must be a valid date in DD-MM-YYYY format',
      });
    }

    if (!ALLOWED_GENDERS.has(normalizedGender)) {
      return res.status(400).json({
        message: 'gender must be one of: male, female, other',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
    }).lean();

    if (existingUser) {
      const field = existingUser.phone === normalizedPhone ? 'phone' : 'email';
      return res.status(409).json({
        message: `A user with this ${field} already exists`,
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      dob: parsedDob,
      gender: normalizedGender,
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        message: `A user with this ${duplicateField} already exists`,
      });
    }

    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { phone, dob } = req.body;

    if (!phone || !dob) {
      return res.status(400).json({
        message: 'phone and dob are required',
      });
    }

    const normalizedPhone = String(phone).trim();
    const parsedDob = parseDobToUtcDate(String(dob));

    if (!E164_PHONE_REGEX.test(normalizedPhone)) {
      return res.status(400).json({
        message: 'phone must be a valid E.164 format',
      });
    }

    if (!parsedDob) {
      return res.status(400).json({
        message: 'dob must be a valid date in DD-MM-YYYY format',
      });
    }

    const nextDay = new Date(parsedDob.getTime() + 24 * 60 * 60 * 1000);

    const user = await User.findOne({
      phone: normalizedPhone,
      dob: {
        $gte: parsedDob,
        $lt: nextDay,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid phone or dob',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
