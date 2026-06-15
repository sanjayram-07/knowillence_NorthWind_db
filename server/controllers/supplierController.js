const supplierService = require('../services/supplierService');

const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById
};
