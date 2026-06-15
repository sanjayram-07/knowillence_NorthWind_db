const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authRequired } = require('../middleware/auth');

router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/recent', orderController.getRecentOrders);
router.get('/pending', orderController.getPendingOrders);
router.post('/', authRequired, orderController.createOrder);
router.get('/:id', orderController.getOrderById);

module.exports = router;
