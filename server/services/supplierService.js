const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { createServiceError } = require('./serviceError');

const getAllSuppliers = async () => {
  return Supplier.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'SupplierID',
        foreignField: 'SupplierID',
        as: 'products'
      }
    },
    {
      $project: {
        SupplierID: 1,
        CompanyName: 1,
        ContactName: 1,
        ContactTitle: 1,
        Country: 1,
        Phone: 1,
        productCount: { $size: '$products' }
      }
    }
  ]);
};

const getSupplierById = async (id) => {
  const supplierId = parseInt(id, 10);
  const supplier = await Supplier.findOne({ SupplierID: supplierId }).lean();

  if (!supplier) {
    throw createServiceError(404, 'Supplier not found');
  }

  const products = await Product.find({ SupplierID: supplierId }).lean();

  return { ...supplier, products };
};

module.exports = {
  getAllSuppliers,
  getSupplierById
};
