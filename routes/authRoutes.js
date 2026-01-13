// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// Login / Logout
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;