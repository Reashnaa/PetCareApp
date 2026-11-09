const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const authController = require('../controllers/authController');

router.get('/signup', authController.showSignup);
router.post('/signup', upload.single('pet_image'), authController.signup);
router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
