const mongoose = require('mongoose');

const Test = require('../models/test.model');
const TestFieldTemplate = require('../models/test-field-template.model');
const {
  TEST_CENTERS,
  TEST_FIELD_INPUT_TYPES,
  TEST_MODES,
  TEST_SUBJECTS,
} = require('../constants/test.constants');
const {
  formatDateToIso,
  normalizeBoolean,
  normalizeCenterList,
  normalizeFieldInputType,
  normalizeFieldKey,
  normalizeMode,
  normalizePrizes,
  normalizeString,
  normalizeSubjectList,
  parseIsoDateToUtcDate,
  resolveFeeFields,
} = require('../utils/test.utils');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeTest = (test) => ({
  id: test._id,
  testName: test.testName,
  testDate: formatDateToIso(test.testDate),
  centers: test.centers,
  centerDetails: test.centers.map((centerId) => TEST_CENTERS[centerId]).filter(Boolean),
  subjects: test.subjects,
  prizes: test.prizes || null,
  hasFee: test.hasFee,
  fee: test.fee,
  mode: test.mode,
  testRules: test.testRules,
  testDescription: test.testDescription,
  isRegistrationOpen: test.isRegistrationOpen,
  customFields: test.customFields || [],
  createdBy: test.createdBy,
  isDeleted: test.isDeleted,
  deletedAt: test.deletedAt,
  createdAt: test.createdAt,
  updatedAt: test.updatedAt,
});

const buildCustomFieldSnapshots = async (customFieldsInput) => {
  if (customFieldsInput === null) {
    return { value: [] };
  }

  if (!Array.isArray(customFieldsInput)) {
    return { error: 'customFields must be an array' };
  }

  if (customFieldsInput.length === 0) {
    return { value: [] };
  }

  const templateIdsToFetch = [];

  for (const field of customFieldsInput) {
    if (!field || typeof field !== 'object' || Array.isArray(field)) {
      return { error: 'Each custom field must be an object' };
    }

    if (field.templateId !== undefined && field.templateId !== null) {
      if (!isValidObjectId(field.templateId)) {
        return { error: `Invalid templateId: ${String(field.templateId)}` };
      }

      templateIdsToFetch.push(String(field.templateId));
    }
  }

  const uniqueTemplateIds = [...new Set(templateIdsToFetch)];
  const templates =
    uniqueTemplateIds.length > 0
      ? await TestFieldTemplate.find({ _id: { $in: uniqueTemplateIds } })
      : [];

  const templatesById = new Map(templates.map((template) => [String(template._id), template]));

  if (templatesById.size !== uniqueTemplateIds.length) {
    return { error: 'One or more templateId values do not exist' };
  }

  const snapshots = [];
  const seenKeys = new Set();

  for (const field of customFieldsInput) {
    let snapshot = null;

    if (field.templateId !== undefined && field.templateId !== null) {
      const template = templatesById.get(String(field.templateId));

      if (!template) {
        return { error: `Template not found: ${String(field.templateId)}` };
      }

      const requiredOverride =
        field.required === undefined ? template.requiredByDefault : normalizeBoolean(field.required);

      if (requiredOverride === null) {
        return { error: `customFields.required must be true or false for template ${template.key}` };
      }

      snapshot = {
        templateId: template._id,
        key: template.key,
        label: template.label,
        inputType: template.inputType,
        required: requiredOverride,
        value: field.value === undefined ? null : field.value,
      };
    } else {
      const key = normalizeFieldKey(field.key);

      if (!key) {
        return { error: 'customFields.key must match /^[a-z][a-z0-9_]{1,49}$/' };
      }

      const label = normalizeString(field.label);

      if (!label) {
        return { error: `customFields.label is required for key ${key}` };
      }

      const inputType = normalizeFieldInputType(field.inputType);

      if (!inputType || !TEST_FIELD_INPUT_TYPES.includes(inputType)) {
        return { error: `customFields.inputType is invalid for key ${key}` };
      }

      const required = field.required === undefined ? false : normalizeBoolean(field.required);

      if (required === null) {
        return { error: `customFields.required must be true or false for key ${key}` };
      }

      snapshot = {
        templateId: null,
        key,
        label,
        inputType,
        required,
        value: field.value === undefined ? null : field.value,
      };
    }

    if (seenKeys.has(snapshot.key)) {
      return { error: `Duplicate custom field key is not allowed: ${snapshot.key}` };
    }

    seenKeys.add(snapshot.key);
    snapshots.push(snapshot);
  }

  return { value: snapshots };
};

const buildTestPayload = async ({ body, isCreate, existingTest }) => {
  const updates = {};

  if (isCreate || body.testName !== undefined) {
    const testName = normalizeString(body.testName);

    if (!testName) {
      return { error: 'testName is required' };
    }

    updates.testName = testName;
  }

  if (isCreate || body.testDate !== undefined) {
    const testDate = parseIsoDateToUtcDate(body.testDate);

    if (!testDate) {
      return { error: 'testDate must be a valid date in YYYY-MM-DD format' };
    }

    updates.testDate = testDate;
  }

  if (isCreate || body.centers !== undefined) {
    const centersResult = normalizeCenterList(body.centers, { required: true });

    if (centersResult.error) {
      return { error: centersResult.error };
    }

    updates.centers = centersResult.value;
  }

  if (isCreate || body.subjects !== undefined) {
    const subjectsResult = normalizeSubjectList(body.subjects, { required: true });

    if (subjectsResult.error) {
      return { error: subjectsResult.error };
    }

    updates.subjects = subjectsResult.value;
  }

  if (body.prizes !== undefined) {
    const prizesResult = normalizePrizes(body.prizes);

    if (prizesResult.error) {
      return { error: prizesResult.error };
    }

    updates.prizes = prizesResult.value;
  }

  if (isCreate || body.hasFee !== undefined || body.fee !== undefined) {
    const feeResult = resolveFeeFields({
      bodyHasFee: body.hasFee,
      bodyFee: body.fee,
      existingHasFee: existingTest?.hasFee,
      existingFee: existingTest?.fee,
      isCreate,
    });

    if (feeResult.error) {
      return { error: feeResult.error };
    }

    updates.hasFee = feeResult.hasFee;
    updates.fee = feeResult.fee;
  }

  if (body.mode !== undefined) {
    const modeResult = normalizeMode(body.mode);

    if (modeResult.error) {
      return { error: modeResult.error };
    }

    if (modeResult.value !== null && !TEST_MODES.includes(modeResult.value)) {
      return { error: 'mode must be one of: online, offline' };
    }

    updates.mode = modeResult.value;
  }

  if (body.testRules !== undefined) {
    updates.testRules = body.testRules === null ? '' : normalizeString(body.testRules);
  }

  if (body.testDescription !== undefined) {
    updates.testDescription = body.testDescription === null ? '' : normalizeString(body.testDescription);
  }

  if (body.isRegistrationOpen !== undefined) {
    const registrationOpen = normalizeBoolean(body.isRegistrationOpen);

    if (registrationOpen === null) {
      return { error: 'isRegistrationOpen must be true or false' };
    }

    updates.isRegistrationOpen = registrationOpen;
  }

  if (body.customFields !== undefined) {
    const customFieldsResult = await buildCustomFieldSnapshots(body.customFields);

    if (customFieldsResult.error) {
      return { error: customFieldsResult.error };
    }

    updates.customFields = customFieldsResult.value;
  }

  if (updates.subjects && updates.subjects.some((subject) => !TEST_SUBJECTS.includes(subject))) {
    return { error: 'subjects contains unsupported values' };
  }

  return { value: updates };
};

const createTest = async (req, res, next) => {
  try {
    const payloadResult = await buildTestPayload({
      body: req.body,
      isCreate: true,
      existingTest: null,
    });

    if (payloadResult.error) {
      return res.status(400).json({ message: payloadResult.error });
    }

    const test = await Test.create({
      ...payloadResult.value,
      createdBy: req.auth?.phone || 'admin',
    });

    return res.status(201).json({
      success: true,
      data: sanitizeTest(test),
    });
  } catch (error) {
    return next(error);
  }
};

const getAllTests = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.includeDeleted === undefined) {
      query.isDeleted = false;
    } else {
      const includeDeleted = normalizeBoolean(req.query.includeDeleted);

      if (includeDeleted === null) {
        return res.status(400).json({ message: 'includeDeleted must be true or false' });
      }

      if (!includeDeleted) {
        query.isDeleted = false;
      }
    }

    if (req.query.registrationOpen !== undefined) {
      const registrationOpen = normalizeBoolean(req.query.registrationOpen);

      if (registrationOpen === null) {
        return res.status(400).json({ message: 'registrationOpen must be true or false' });
      }

      query.isRegistrationOpen = registrationOpen;
    }

    const tests = await Test.find(query).sort({ testDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tests.length,
      data: tests.map(sanitizeTest),
    });
  } catch (error) {
    return next(error);
  }
};

const getTestById = async (req, res, next) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({ message: 'Invalid testId' });
    }

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeTest(test),
    });
  } catch (error) {
    return next(error);
  }
};

const updateTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({ message: 'Invalid testId' });
    }

    const existingTest = await Test.findOne({ _id: testId, isDeleted: false });

    if (!existingTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const payloadResult = await buildTestPayload({
      body: req.body,
      isCreate: false,
      existingTest,
    });

    if (payloadResult.error) {
      return res.status(400).json({ message: payloadResult.error });
    }

    if (Object.keys(payloadResult.value).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const updatedTest = await Test.findByIdAndUpdate(testId, payloadResult.value, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: sanitizeTest(updatedTest),
    });
  } catch (error) {
    return next(error);
  }
};

const deleteTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({ message: 'Invalid testId' });
    }

    const deletedTest = await Test.findOneAndUpdate(
      { _id: testId, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        isRegistrationOpen: false,
      },
      { new: true }
    );

    if (!deletedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
      data: sanitizeTest(deletedTest),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
};
