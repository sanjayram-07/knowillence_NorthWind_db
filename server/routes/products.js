const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/stats', productController.getProductStats);
router.get('/low-stock', productController.getLowStock);
router.get('/discontinued', productController.getDiscontinuedProducts);
router.get('/categories', productController.getCategories);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
