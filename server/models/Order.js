const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  OrderID: Number,
  CustomerID: String,
  EmployeeID: Number,
  OrderDate: Date,
  RequiredDate: Date,
  ShippedDate: Date,
  ShipVia: Number,
  Freight: Number,
  ShipName: String,
  ShipAddress: String,
  ShipCity: String,
  ShipRegion: String,
  ShipPostalCode: String,
  ShipCountry: String
}, { strict: false, collection: 'orders' });

module.exports = mongoose.model('Order', orderSchema);
