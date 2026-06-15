const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  CustomerID: String,
  CompanyName: String,
  ContactName: String,
  ContactTitle: String,
  Address: String,
  City: String,
  Region: String,
  PostalCode: String,
  Country: String,
  Phone: String,
  Fax: String
}, { strict: false, collection: 'customers' });

module.exports = mongoose.model('Customer', customerSchema);
