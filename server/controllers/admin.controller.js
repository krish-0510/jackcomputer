const User = require('../models/user.model');

const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllStudents,
};
