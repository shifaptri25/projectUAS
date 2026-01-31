const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

const { getOrders, createOrder, getMyOrders, getOrderById, updateOrderStatus } = orderController;

// ROUTES
router.get('/', auth,getOrders);              
router.post('/', auth, createOrder);         
router.get('/my', auth, getMyOrders);          
router.get('/:id', auth, getOrderById);     
router.get('/:id/status', auth , updateOrderStatus);   
router.put('/:id/status', auth, isAdmin , updateOrderStatus); 

module.exports = router;   