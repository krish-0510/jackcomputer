const express = require('express');

const { registerUser, loginUser } = require('../controllers/user.controller');
const { createTestRegistration, getAvailableTestsForUser, getMyRegistrations } = require('../controllers/user-test.controller');
const { authenticateJWT, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.use(authenticateJWT, requireRole('user'));

router.get('/tests', getAvailableTestsForUser);
router.post('/tests/:testId/registrations', createTestRegistration);
router.get('/registrations', getMyRegistrations);

module.exports = router;
