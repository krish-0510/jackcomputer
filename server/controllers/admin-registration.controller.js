const mongoose = require('mongoose');

const Test = require('../models/test.model');
const TestRegistration = require('../models/test-registration.model');
const { TEST_CENTERS } = require('../constants/test.constants');
const {
  formatDateToIso,
  normalizeCenter,
  normalizeSlotRange,
  normalizeSubject,
  normalizeSubjectList,
} = require('../utils/test.utils');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parsePositiveInteger = (value, defaultValue, maxValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  if (maxValue && parsed > maxValue) {
    return maxValue;
  }

  return parsed;
};

const sanitizeRegistration = (registration) => {
  const user = registration.userId;

  return {
    id: registration._id,
    testId: registration.testId,
    userId: user?._id || registration.userId,
    center: registration.center,
    centerDetails: TEST_CENTERS[registration.center] || null,
    subjectSelections: registration.subjectSelections,
    user: user
      ? {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          dob: formatDateToIso(user.dob),
          gender: user.gender,
        }
      : null,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
};

const normalizeSubjectSelections = (subjectSelectionsInput) => {
  if (!Array.isArray(subjectSelectionsInput) || subjectSelectionsInput.length === 0) {
    return { error: 'subjectSelections must be a non-empty array' };
  }

  const normalized = [];
  const seenSubjects = new Set();

  for (const item of subjectSelectionsInput) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { error: 'Each subject selection must be an object' };
    }

    const subject = normalizeSubject(item.subject);

    if (!subject) {
      return { error: `Invalid subject in subjectSelections: ${String(item.subject)}` };
    }

    if (seenSubjects.has(subject)) {
      return { error: `Duplicate subject in subjectSelections: ${subject}` };
    }

    const slotResult = normalizeSlotRange(item.slot);

    if (slotResult.error) {
      return { error: `Invalid slot for subject ${subject}: ${slotResult.error}` };
    }

    normalized.push({
      subject,
      slot: slotResult.value,
    });

    seenSubjects.add(subject);
  }

  return { value: normalized };
};

const applySubjectSlotsPatch = (subjectSelections, subjectSlotsInput) => {
  if (typeof subjectSlotsInput !== 'object' || subjectSlotsInput === null || Array.isArray(subjectSlotsInput)) {
    return { error: 'subjectSlots must be an object where key is subject and value is slot' };
  }

  const updatedSelections = subjectSelections.map((selection) => ({ ...selection }));

  for (const [subjectKey, slotValue] of Object.entries(subjectSlotsInput)) {
    const subject = normalizeSubject(subjectKey);

    if (!subject) {
      return { error: `Invalid subject key in subjectSlots: ${subjectKey}` };
    }

    const selectionIndex = updatedSelections.findIndex((selection) => selection.subject === subject);

    if (selectionIndex === -1) {
      return { error: `Cannot assign slot for unselected subject: ${subject}` };
    }

    const slotResult = normalizeSlotRange(slotValue);

    if (slotResult.error) {
      return { error: `Invalid slot for subject ${subject}: ${slotResult.error}` };
    }

    updatedSelections[selectionIndex].slot = slotResult.value;
  }

  return { value: updatedSelections };
};

const getTestRegistrations = async (req, res, next) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({ message: 'Invalid testId' });
    }

    const test = await Test.findById(testId).lean();

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 20, 100);

    if (page === null || limit === null) {
      return res.status(400).json({ message: 'page and limit must be positive integers' });
    }

    const query = { testId };

    if (req.query.center !== undefined) {
      const center = normalizeCenter(req.query.center);

      if (!center) {
        return res.status(400).json({ message: 'Invalid center filter value' });
      }

      query.center = center;
    }

    if (req.query.subject !== undefined) {
      const subject = normalizeSubject(req.query.subject);

      if (!subject) {
        return res.status(400).json({ message: 'Invalid subject filter value' });
      }

      query['subjectSelections.subject'] = subject;
    }

    const skip = (page - 1) * limit;
    const [total, registrations] = await Promise.all([
      TestRegistration.countDocuments(query),
      TestRegistration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name phone email dob gender'),
    ]);

    return res.status(200).json({
      success: true,
      test: {
        id: test._id,
        testName: test.testName,
        testDate: formatDateToIso(test.testDate),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      data: registrations.map(sanitizeRegistration),
    });
  } catch (error) {
    return next(error);
  }
};

const updateRegistrationByAdmin = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    if (!isValidObjectId(registrationId)) {
      return res.status(400).json({ message: 'Invalid registrationId' });
    }

    const registration = await TestRegistration.findById(registrationId).populate('userId', 'name phone email dob gender');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const test = await Test.findOne({ _id: registration.testId, isDeleted: false }).lean();

    if (!test) {
      return res.status(404).json({ message: 'Associated test not found or deleted' });
    }

    if (req.body.subjectSelections !== undefined && req.body.subjects !== undefined) {
      return res
        .status(400)
        .json({ message: 'Provide either subjectSelections or subjects, not both in the same request' });
    }

    let nextCenter = registration.center;
    let nextSubjectSelections = registration.subjectSelections.map((selection) => ({
      subject: selection.subject,
      slot: selection.slot || null,
    }));

    if (req.body.center !== undefined) {
      const center = normalizeCenter(req.body.center);

      if (!center) {
        return res.status(400).json({ message: 'center is invalid' });
      }

      if (!test.centers.includes(center)) {
        return res.status(400).json({ message: 'center must be one of the centers configured for this test' });
      }

      nextCenter = center;
    }

    if (req.body.subjectSelections !== undefined) {
      const subjectSelectionsResult = normalizeSubjectSelections(req.body.subjectSelections);

      if (subjectSelectionsResult.error) {
        return res.status(400).json({ message: subjectSelectionsResult.error });
      }

      nextSubjectSelections = subjectSelectionsResult.value;
    }

    if (req.body.subjects !== undefined) {
      const subjectsResult = normalizeSubjectList(req.body.subjects, { required: true });

      if (subjectsResult.error) {
        return res.status(400).json({ message: subjectsResult.error });
      }

      const existingSlots = new Map(
        nextSubjectSelections.map((selection) => [selection.subject, selection.slot || null])
      );

      nextSubjectSelections = subjectsResult.value.map((subject) => ({
        subject,
        slot: existingSlots.get(subject) || null,
      }));
    }

    if (req.body.subjectSlots !== undefined) {
      const slotPatchResult = applySubjectSlotsPatch(nextSubjectSelections, req.body.subjectSlots);

      if (slotPatchResult.error) {
        return res.status(400).json({ message: slotPatchResult.error });
      }

      nextSubjectSelections = slotPatchResult.value;
    }

    if (nextSubjectSelections.length === 0) {
      return res.status(400).json({ message: 'At least one subject must remain selected' });
    }

    const invalidSubject = nextSubjectSelections.find((selection) => !test.subjects.includes(selection.subject));

    if (invalidSubject) {
      return res.status(400).json({
        message: `Subject ${invalidSubject.subject} is not available in this test`,
      });
    }

    registration.center = nextCenter;
    registration.subjectSelections = nextSubjectSelections;

    await registration.save();

    return res.status(200).json({
      success: true,
      data: sanitizeRegistration(registration),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTestRegistrations,
  updateRegistrationByAdmin,
};
