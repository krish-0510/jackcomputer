const express = require('express');

const { loginAdmin } = require('../controllers/admin-auth.controller');
const { getAllStudents } = require('../controllers/admin.controller');
const {
  createTestFieldTemplate,
  deleteTestFieldTemplate,
  getAllTestFieldTemplates,
  getTestFieldTemplateById,
  updateTestFieldTemplate,
} = require('../controllers/admin-test-field.controller');
const { createTest, deleteTest, getAllTests, getTestById, updateTest } = require('../controllers/admin-test.controller');
const { getTestRegistrations, updateRegistrationByAdmin } = require('../controllers/admin-registration.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', loginAdmin);

router.use(authenticateJWT, requireRole('admin'));

router.get('/students', getAllStudents);

router.post('/test-fields', createTestFieldTemplate);
router.get('/test-fields', getAllTestFieldTemplates);
router.get('/test-fields/:templateId', getTestFieldTemplateById);
router.patch('/test-fields/:templateId', updateTestFieldTemplate);
router.delete('/test-fields/:templateId', deleteTestFieldTemplate);

router.post('/tests', createTest);
router.get('/tests', getAllTests);
router.get('/tests/:testId', getTestById);
router.patch('/tests/:testId', updateTest);
router.delete('/tests/:testId', deleteTest);
router.get('/tests/:testId/registrations', getTestRegistrations);

router.patch('/registrations/:registrationId', updateRegistrationByAdmin);

module.exports = router;
