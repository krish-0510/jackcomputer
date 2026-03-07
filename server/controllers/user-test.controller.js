const mongoose = require('mongoose');

const Test = require('../models/test.model');
const TestRegistration = require('../models/test-registration.model');
const { TEST_CENTERS } = require('../constants/test.constants');
const {
  formatDateToIso,
  normalizeBoolean,
  normalizeCenter,
  normalizeSubjectList,
} = require('../utils/test.utils');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeTestForUser = (test, registrationMap) => ({
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
  alreadyRegistered: registrationMap.has(String(test._id)),
  createdAt: test.createdAt,
  updatedAt: test.updatedAt,
});

const sanitizeUserRegistration = (registration) => ({
  id: registration._id,
  test: registration.testId
    ? {
        id: registration.testId._id,
        testName: registration.testId.testName,
        testDate: formatDateToIso(registration.testId.testDate),
        subjects: registration.testId.subjects,
        centers: registration.testId.centers,
      }
    : null,
  center: registration.center,
  centerDetails: TEST_CENTERS[registration.center] || null,
  subjectSelections: registration.subjectSelections,
  createdAt: registration.createdAt,
  updatedAt: registration.updatedAt,
});

const getAvailableTestsForUser = async (req, res, next) => {
  try {
    const query = {
      isDeleted: false,
    };

    if (req.query.registrationOpen !== undefined) {
      const registrationOpen = normalizeBoolean(req.query.registrationOpen);

      if (registrationOpen === null) {
        return res.status(400).json({ message: 'registrationOpen must be true or false' });
      }

      query.isRegistrationOpen = registrationOpen;
    }

    const userId = req.auth?.sub;

    if (!isValidObjectId(userId)) {
      return res.status(401).json({ message: 'Invalid user token payload' });
    }

    const [tests, registrations] = await Promise.all([
      Test.find(query).sort({ testDate: 1, createdAt: -1 }),
      TestRegistration.find({ userId }).select('testId').lean(),
    ]);

    const registrationMap = new Map(registrations.map((item) => [String(item.testId), true]));

    return res.status(200).json({
      success: true,
      count: tests.length,
      data: tests.map((test) => sanitizeTestForUser(test, registrationMap)),
    });
  } catch (error) {
    return next(error);
  }
};

const createTestRegistration = async (req, res, next) => {
  try {
    const { testId } = req.params;

    if (!isValidObjectId(testId)) {
      return res.status(400).json({ message: 'Invalid testId' });
    }

    if (
      req.body.subjectSelections !== undefined ||
      req.body.slot !== undefined ||
      req.body.subjectSlots !== undefined
    ) {
      return res.status(400).json({ message: 'Users cannot submit slot or subjectSelections while registering' });
    }

    if (req.body.userId !== undefined) {
      return res.status(400).json({ message: 'userId is derived from token and must not be sent in request body' });
    }

    const userId = req.auth?.sub;

    if (!isValidObjectId(userId)) {
      return res.status(401).json({ message: 'Invalid user token payload' });
    }

    const center = normalizeCenter(req.body.center);

    if (!center) {
      return res.status(400).json({ message: 'center is required and must be valid' });
    }

    const subjectsResult = normalizeSubjectList(req.body.subjects, { required: true });

    if (subjectsResult.error) {
      return res.status(400).json({ message: subjectsResult.error });
    }

    const test = await Test.findOne({ _id: testId, isDeleted: false });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (!test.isRegistrationOpen) {
      return res.status(400).json({ message: 'Registration is closed for this test' });
    }

    if (!test.centers.includes(center)) {
      return res.status(400).json({ message: 'Selected center is not available for this test' });
    }

    const unsupportedSubject = subjectsResult.value.find((subject) => !test.subjects.includes(subject));

    if (unsupportedSubject) {
      return res.status(400).json({ message: `Subject ${unsupportedSubject} is not available for this test` });
    }

    const registration = await TestRegistration.create({
      testId,
      userId,
      center,
      subjectSelections: subjectsResult.value.map((subject) => ({
        subject,
        slot: null,
      })),
    });

    return res.status(201).json({
      success: true,
      data: {
        id: registration._id,
        testId: registration.testId,
        userId: registration.userId,
        center: registration.center,
        centerDetails: TEST_CENTERS[registration.center] || null,
        subjectSelections: registration.subjectSelections,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'You are already registered for this test' });
    }

    return next(error);
  }
};

const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.auth?.sub;

    if (!isValidObjectId(userId)) {
      return res.status(401).json({ message: 'Invalid user token payload' });
    }

    const registrations = await TestRegistration.find({ userId })
      .sort({ createdAt: -1 })
      .populate('testId', 'testName testDate subjects centers isRegistrationOpen isDeleted');

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations.map(sanitizeUserRegistration),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAvailableTestsForUser,
  createTestRegistration,
  getMyRegistrations,
};
