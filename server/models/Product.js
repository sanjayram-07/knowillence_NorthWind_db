const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ProductID: Number,
  ProductName: String,
  SupplierID: Number,
  CategoryID: Number,
  QuantityPerUnit: String,
  UnitPrice: Number,
  UnitsInStock: Number,
  UnitsOnOrder: Number,
  ReorderLevel: Number,
  Discontinued: Number
}, { strict: false, collection: 'products' });

module.exports = mongoose.model('Product', productSchema);
