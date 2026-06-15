const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { createServiceError } = require('./serviceError');

const getAllOrders = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 20;
  const { customerId, startDate, endDate, status } = queryParams;

  const query = {};

  if (customerId) query.CustomerID = customerId;
  if (startDate) query.OrderDate = { ...query.OrderDate, $gte: new Date(startDate) };
  if (endDate) query.OrderDate = { ...query.OrderDate, $lte: new Date(endDate) };
  if (status === 'pending') query.ShippedDate = null;
  if (status === 'shipped') query.ShippedDate = { $ne: null };

  const total = await Order.countDocuments(query);
  const orders = await Order.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'customers',
        let: { customerId: '$CustomerID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$CustomerID' }, { $toString: '$$customerId' }]
              }
            }
          }
        ],
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'orderDetails',
        let: { orderId: '$OrderID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$OrderID' }, { $toString: '$$orderId' }]
              }
            }
          },
          {
            $addFields: {
              lineTotal: {
                $multiply: [
                  '$UnitPrice',
                  '$Quantity',
                  { $subtract: [1, { $ifNull: ['$Discount', 0] }] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              subtotal: { $sum: '$lineTotal' }
            }
          }
        ],
        as: 'lineTotals'
      }
    },
    {
      $addFields: {
        subtotal: { $ifNull: [{ $arrayElemAt: ['$lineTotals.subtotal', 0] }, 0] },
        orderTotal: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$lineTotals.subtotal', 0] }, 0] },
            { $ifNull: ['$Freight', 0] }
          ]
        }
      }
    },
    { $project: { lineTotals: 0 } },
    { $sort: { OrderDate: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ]);

  return {
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

const getOrderById = async (id) => {
  const orderId = parseInt(id, 10);
  const order = await Order.findOne({ OrderID: orderId }).lean();

  if (!order) {
    throw createServiceError(404, 'Order not found');
  }

  const details = await OrderDetail.aggregate([
    { $match: { OrderID: orderId } },
    {
      $lookup: {
        from: 'products',
        localField: 'ProductID',
        foreignField: 'ProductID',
        as: 'product'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
  ]);

  const customer = await Customer.findOne({ CustomerID: order.CustomerID }).lean();

  return { ...order, details, customer };
};

const getRecentOrders = async (queryParams = {}) => {
  const limit = parseInt(queryParams.limit, 10) || 10;

  return Order.aggregate([
    { $sort: { OrderDate: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'customers',
        localField: 'CustomerID',
        foreignField: 'CustomerID',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
  ]);
};

const getPendingOrders = async () => {
  return Order.aggregate([
    { $match: { ShippedDate: null } },
    {
      $lookup: {
        from: 'customers',
        localField: 'CustomerID',
        foreignField: 'CustomerID',
        as: 'customer'
      }
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    { $sort: { OrderDate: -1 } }
  ]);
};

const getOrderStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayCount = await Order.countDocuments({
    OrderDate: { $gte: today }
  });

  const thisWeekCount = await Order.countDocuments({
    OrderDate: { $gte: weekAgo }
  });

  const pendingCount = await Order.countDocuments({
    ShippedDate: null
  });

  const avgFreightResult = await Order.aggregate([
    { $group: { _id: null, avgFreight: { $avg: '$Freight' } } }
  ]);

  return {
    todayCount,
    thisWeekCount,
    pendingCount,
    avgFreight: avgFreightResult[0]?.avgFreight || 0
  };
};

const getNextOrderId = async () => {
  const orders = await Order.find().select('OrderID').lean();
  let maxId = 11000;
  orders.forEach((order) => {
    const value = parseInt(String(order.OrderID), 10);
    if (!Number.isNaN(value) && value > maxId) maxId = value;
  });
  return maxId + 1;
};

const createOrder = async (payload = {}) => {
  const { CustomerID, items, ShipName, ShipAddress, ShipCity, ShipCountry, Freight } = payload;

  if (!CustomerID) {
    throw createServiceError(400, 'Customer is required');
  }
  if (!items?.length) {
    throw createServiceError(400, 'Add at least one product');
  }

  const customer = await Customer.findOne({ CustomerID }).lean();
  if (!customer) {
    throw createServiceError(400, 'Customer not found');
  }

  const orderIdNum = await getNextOrderId();
  const orderIdStr = String(orderIdNum);
  const now = new Date();

  const order = await Order.create({
    OrderID: orderIdStr,
    CustomerID,
    EmployeeID: 1,
    OrderDate: now,
    RequiredDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    ShippedDate: null,
    ShipVia: 1,
    Freight: parseFloat(Freight) || 0,
    ShipName: ShipName || customer.CompanyName,
    ShipAddress: ShipAddress || customer.Address || '',
    ShipCity: ShipCity || customer.City || '',
    ShipRegion: customer.Region || '',
    ShipPostalCode: customer.PostalCode || '',
    ShipCountry: ShipCountry || customer.Country || 'India'
  });

  const lineItems = [];

  for (const item of items) {
    const productId = parseInt(item.ProductID, 10);
    const quantity = parseInt(item.Quantity, 10) || 1;
    const product = await Product.findOne({ ProductID: productId });

    if (!product) {
      throw createServiceError(400, `Product ${productId} not found`);
    }
    if (product.Discontinued === 1) {
      throw createServiceError(400, `${product.ProductName} is discontinued`);
    }
    if ((product.UnitsInStock || 0) < quantity) {
      throw createServiceError(400, `Insufficient stock for ${product.ProductName}`);
    }

    const parsedUnitPrice = parseFloat(item.UnitPrice);
    const unitPrice = Number.isNaN(parsedUnitPrice) ? product.UnitPrice : parsedUnitPrice;

    await OrderDetail.create({
      OrderID: orderIdNum,
      ProductID: productId,
      UnitPrice: unitPrice,
      Quantity: quantity,
      Discount: 0
    });

    product.UnitsInStock = (product.UnitsInStock || 0) - quantity;
    await product.save();

    lineItems.push({
      ProductID: productId,
      ProductName: product.ProductName,
      Quantity: quantity,
      UnitPrice: unitPrice,
      lineTotal: unitPrice * quantity
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    order,
    lineItems,
    subtotal,
    freight: order.Freight,
    total: subtotal + (order.Freight || 0)
  };
};

module.exports = {
  getAllOrders,
  getOrderById,
  getRecentOrders,
  getPendingOrders,
  getOrderStats,
  createOrder
};
