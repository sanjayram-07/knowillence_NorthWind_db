const customerService = require('../services/customerService');

const getAllCustomers = async (req, res, next) => {
  try {
    const result = await customerService.getAllCustomers(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const orders = await customerService.getCustomerOrders(req.params.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getAtRiskCustomersList = async (req, res, next) => {
  try {
    const data = await customerService.getAtRiskCustomersList();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCustomerStats = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerStats();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getCustomersWithStats = async (req, res, next) => {
  try {
    const result = await customerService.getCustomersWithStats(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  getAtRiskCustomersList,
  getCustomerStats,
  getCustomersWithStats,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
