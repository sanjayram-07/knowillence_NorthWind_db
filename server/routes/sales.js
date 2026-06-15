const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/overview', salesController.getOverview);
router.get('/revenue-by-month', salesController.getMonthlyRevenue);
router.get('/revenue-by-category', salesController.getCategoryRevenue);
router.get('/top-products', salesController.getTopProductsList);
router.get('/top-customers', salesController.getTopCustomersList);
router.get('/by-country', salesController.getCountryRevenue);

module.exports = router;
