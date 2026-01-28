const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const { validateProduct } = require('../middlewares/validation');

// Public
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected: Seller only
router.post('/', auth, validateProduct, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
