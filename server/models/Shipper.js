const mongoose = require('mongoose');

const shipperSchema = new mongoose.Schema({
  ShipperID: Number,
  CompanyName: String,
  Phone: String
}, { strict: false, collection: 'shippers' });

module.exports = mongoose.model('Shipper', shipperSchema);
