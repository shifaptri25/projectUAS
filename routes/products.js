const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const { validateProduct } = require('../middlewares/validation');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', auth, validateProduct, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
