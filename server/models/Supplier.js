const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  SupplierID: Number,
  CompanyName: String,
  ContactName: String,
  ContactTitle: String,
  Address: String,
  City: String,
  Country: String,
  Phone: String,
  Fax: String,
  HomePage: String
}, { strict: false, collection: 'suppliers' });

module.exports = mongoose.model('Supplier', supplierSchema);
