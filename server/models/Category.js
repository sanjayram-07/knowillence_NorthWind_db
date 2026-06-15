const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  CategoryID: Number,
  CategoryName: String,
  Description: String,
  Picture: mongoose.Schema.Types.Mixed
}, { strict: false, collection: 'categories' });

module.exports = mongoose.model('Category', categorySchema);
