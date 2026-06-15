const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  OrderID: Number,
  ProductID: Number,
  UnitPrice: Number,
  Quantity: Number,
  Discount: Number
}, { strict: false, collection: 'orderDetails' });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
