const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomers);
router.get('/stats', customerController.getCustomerStats);
router.get('/at-risk', customerController.getAtRiskCustomersList);
router.get('/with-stats', customerController.getCustomersWithStats);
router.post('/', customerController.createCustomer);
router.get('/:id/orders', customerController.getCustomerOrders);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
