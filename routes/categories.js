const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

// Public - FIXED
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);  // ← NAMA BENAR

// Protected
router.post('/', auth, categoryController.createCategory);
router.put('/:id', auth, categoryController.updateCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
