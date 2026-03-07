const mongoose = require('mongoose');

const { TEST_CENTER_IDS, TEST_SUBJECTS, TEST_MODES, TEST_FIELD_INPUT_TYPES } = require('../constants/test.constants');

const prizeSchema = new mongoose.Schema(
  {
    firstPlace: {
      type: Number,
      min: 0,
    },
    secondPlace: {
      type: Number,
      min: 0,
    },
    thirdPlace: {
      type: Number,
      min: 0,
    },
    special: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const customFieldSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestFieldTemplate',
      default: null,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z][a-z0-9_]{1,49}$/,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    inputType: {
      type: String,
      required: true,
      enum: TEST_FIELD_INPUT_TYPES,
    },
    required: {
      type: Boolean,
      default: false,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    centers: {
      type: [
        {
          type: String,
          enum: TEST_CENTER_IDS,
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'centers must contain at least one center',
      },
    },
    subjects: {
      type: [
        {
          type: String,
          enum: TEST_SUBJECTS,
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'subjects must contain at least one subject',
      },
    },
    prizes: {
      type: prizeSchema,
      default: undefined,
    },
    hasFee: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    mode: {
      type: String,
      enum: TEST_MODES,
      default: null,
    },
    testRules: {
      type: String,
      trim: true,
      default: '',
    },
    testDescription: {
      type: String,
      trim: true,
      default: '',
    },
    isRegistrationOpen: {
      type: Boolean,
      default: false,
    },
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

testSchema.index({ isDeleted: 1, testDate: 1 });

module.exports = mongoose.model('Test', testSchema);
