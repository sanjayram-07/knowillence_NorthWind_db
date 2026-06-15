const orderService = require('../services/orderService');

const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getRecentOrders(req.query);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getPendingOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getPendingOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const getOrderStats = async (req, res, next) => {
  try {
    const data = await orderService.getOrderStats();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const data = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getRecentOrders,
  getPendingOrders,
  getOrderStats,
  createOrder
};
