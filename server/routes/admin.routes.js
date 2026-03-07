const express = require('express');

const { getAllStudents } = require('../controllers/admin.controller');

const router = express.Router();

router.get('/students', getAllStudents);

module.exports = router;
