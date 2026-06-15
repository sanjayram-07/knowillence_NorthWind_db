const Product = require('../models/Product');
const Category = require('../models/Category');
const { getLowStockProducts } = require('../utils/aggregations');
const { createServiceError } = require('./serviceError');

const getAllProducts = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const { categoryId, discontinued, lowStock, inStock } = query;

  const matchStage = {};

  if (categoryId) matchStage.CategoryID = parseInt(categoryId, 10);
  if (discontinued === 'true') matchStage.Discontinued = 1;
  if (discontinued === 'false') matchStage.Discontinued = { $ne: 1 };
  if (inStock === 'true') {
    matchStage.Discontinued = { $ne: 1 };
    matchStage.UnitsInStock = { $gt: 0 };
  }
  if (lowStock === 'true') {
    matchStage.$expr = { $lte: ['$UnitsInStock', '$ReorderLevel'] };
  }

  const total = await Product.countDocuments(matchStage);

  const products = await Product.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'CategoryID',
        foreignField: 'CategoryID',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ]);

  return {
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

const getProductById = async (id) => {
  const productId = parseInt(id, 10);

  const product = await Product.aggregate([
    { $match: { ProductID: productId } },
    {
      $lookup: {
        from: 'categories',
        localField: 'CategoryID',
        foreignField: 'CategoryID',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'SupplierID',
        foreignField: 'SupplierID',
        as: 'supplier'
      }
    },
    { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } }
  ]);

  if (!product.length) {
    throw createServiceError(404, 'Product not found');
  }

  return product[0];
};

const getLowStock = async () => getLowStockProducts();

const getDiscontinuedProducts = async () => Product.find({ Discontinued: 1 }).lean();

const getProductStats = async () => {
  const total = await Product.countDocuments();
  const lowStock = await Product.countDocuments({
    $expr: { $lte: ['$UnitsInStock', '$ReorderLevel'] },
    Discontinued: { $ne: 1 }
  });
  const discontinued = await Product.countDocuments({ Discontinued: 1 });
  const categories = await Category.countDocuments();

  return { total, lowStock, discontinued, categories };
};

const getCategories = async () => Category.find().lean();

const getNextProductId = async () => {
  const latest = await Product.findOne().sort({ ProductID: -1 }).select('ProductID').lean();
  return (latest?.ProductID || 0) + 1;
};

const createProduct = async (payload = {}) => {
  const {
    ProductName,
    CategoryID,
    SupplierID,
    QuantityPerUnit,
    UnitPrice,
    UnitsInStock,
    UnitsOnOrder,
    ReorderLevel,
    Discontinued
  } = payload;

  if (!ProductName?.trim()) {
    throw createServiceError(400, 'Product name is required');
  }

  const ProductID = await getNextProductId();
  return Product.create({
    ProductID,
    ProductName: ProductName.trim(),
    CategoryID: CategoryID ? parseInt(CategoryID, 10) : null,
    SupplierID: SupplierID ? parseInt(SupplierID, 10) : null,
    QuantityPerUnit: QuantityPerUnit || '',
    UnitPrice: parseFloat(UnitPrice) || 0,
    UnitsInStock: parseInt(UnitsInStock, 10) || 0,
    UnitsOnOrder: parseInt(UnitsOnOrder, 10) || 0,
    ReorderLevel: parseInt(ReorderLevel, 10) || 0,
    Discontinued: Discontinued ? 1 : 0
  });
};

const updateProduct = async (id, payload = {}) => {
  const productId = parseInt(id, 10);
  const product = await Product.findOne({ ProductID: productId });

  if (!product) {
    throw createServiceError(404, 'Product not found');
  }

  const fields = [
    'ProductName',
    'CategoryID',
    'SupplierID',
    'QuantityPerUnit',
    'UnitPrice',
    'UnitsInStock',
    'UnitsOnOrder',
    'ReorderLevel',
    'Discontinued'
  ];

  fields.forEach((field) => {
    if (payload[field] === undefined) return;
    if (field === 'ProductName') {
      product.ProductName = payload[field].trim();
    } else if (field === 'Discontinued') {
      product.Discontinued = payload[field] ? 1 : 0;
    } else if (['CategoryID', 'SupplierID', 'UnitsInStock', 'UnitsOnOrder', 'ReorderLevel'].includes(field)) {
      product[field] = parseInt(payload[field], 10) || 0;
    } else if (field === 'UnitPrice') {
      product.UnitPrice = parseFloat(payload[field]) || 0;
    } else {
      product[field] = payload[field];
    }
  });

  await product.save();
  return product;
};

const deleteProduct = async (id) => {
  const productId = parseInt(id, 10);
  const product = await Product.findOneAndDelete({ ProductID: productId });

  if (!product) {
    throw createServiceError(404, 'Product not found');
  }

  return { message: 'Product deleted' };
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
