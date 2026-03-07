const mongoose = require('mongoose');

const { TEST_FIELD_INPUT_TYPES } = require('../constants/test.constants');

const testFieldTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[a-z][a-z0-9_]{1,49}$/,
      unique: true,
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
    requiredByDefault: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestFieldTemplate', testFieldTemplateSchema);
