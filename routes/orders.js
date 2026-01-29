const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const { getOrders, createOrder } = require('../controllers/orderController');

module.exports = router;
router.get('/', getOrders);
router.post('/', createOrder);
router.post('/', auth, orderController.createOrder);
router.get('/my', auth, orderController.getMyOrders);
router.get('/:id', auth, orderController.getOrderById);
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
