const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeID: Number,
  LastName: String,
  FirstName: String,
  Title: String,
  BirthDate: Date,
  HireDate: Date,
  City: String,
  Country: String,
  ReportsTo: Number
}, { strict: false, collection: 'employees' });

module.exports = mongoose.model('Employee', employeeSchema);
