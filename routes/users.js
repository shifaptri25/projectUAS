const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// BUYER & SELLER
router.get('/me/profile', auth, user.getMyProfile);
router.put('/me/profile', auth, user.updateMyProfile);

// ADMIN
router.get('/', auth, isAdmin, user.getAllUsers);
router.get('/:id', auth, isAdmin, user.getUserById);
router.put('/:id', auth, isAdmin, user.updateUserById);
router.delete('/:id', auth, isAdmin, user.deleteUserById);

module.exports = router;
