const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Public: Admin only (bisa ditambah role check)
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);

// Protected: Update profile sendiri
router.put('/profile', auth, userController.updateUser);

module.exports = router;
