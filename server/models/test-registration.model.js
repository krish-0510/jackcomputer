const mongoose = require('mongoose');

const { TEST_CENTER_IDS, TEST_SUBJECTS } = require('../constants/test.constants');

const subjectSelectionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      enum: TEST_SUBJECTS,
    },
    slot: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const testRegistrationSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    center: {
      type: String,
      required: true,
      enum: TEST_CENTER_IDS,
    },
    subjectSelections: {
      type: [subjectSelectionSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'subjectSelections must contain at least one subject',
      },
    },
  },
  {
    timestamps: true,
  }
);

testRegistrationSchema.index({ testId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TestRegistration', testRegistrationSchema);
