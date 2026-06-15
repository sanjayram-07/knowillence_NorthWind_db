const productService = require('../services/productService');

const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const data = await productService.getLowStock();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDiscontinuedProducts = async (req, res, next) => {
  try {
    const products = await productService.getDiscontinuedProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductStats = async (req, res, next) => {
  try {
    const data = await productService.getProductStats();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getLowStock,
  getDiscontinuedProducts,
  getProductStats,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
