const OrderDetail = require('../models/OrderDetail');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const { orderLookup, lineTotalAddFields } = require('./lookups');

const getSalesOverview = async () => {
  const revenueResult = await OrderDetail.aggregate([
    lineTotalAddFields,
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$lineTotal' },
        totalOrders: { $addToSet: '$OrderID' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        totalOrders: { $size: '$totalOrders' }
      }
    }
  ]);

  const customerCount = await Customer.countDocuments();
  const productCount = await Product.countDocuments();

  const revenue = revenueResult[0]?.totalRevenue || 0;
  const orders = revenueResult[0]?.totalOrders || 0;

  return {
    totalRevenue: revenue,
    totalOrders: orders,
    totalCustomers: customerCount,
    totalProducts: productCount,
    avgOrderValue: orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0
  };
};

const getRevenueByMonth = async () => {
  return await OrderDetail.aggregate([
    orderLookup,
    { $unwind: '$order' },
    lineTotalAddFields,
    {
      $group: {
        _id: {
          year: { $year: { $toDate: '$order.OrderDate' } },
          month: { $month: { $toDate: '$order.OrderDate' } }
        },
        revenue: { $sum: '$lineTotal' },
        orderCount: { $addToSet: '$OrderID' }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        revenue: { $round: ['$revenue', 2] },
        orderCount: { $size: '$orderCount' }
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
};

const getRevenueByCategory = async () => {
  return await OrderDetail.aggregate([
    {
      $lookup: {
        from: 'products',
        let: { productId: '$ProductID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$ProductID' }, { $toString: '$$productId' }]
              }
            }
          }
        ],
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'categories',
        let: { categoryId: '$product.CategoryID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$CategoryID' }, { $toString: '$$categoryId' }]
              }
            }
          }
        ],
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    lineTotalAddFields,
    {
      $group: {
        _id: '$category.CategoryName',
        revenue: { $sum: '$lineTotal' },
        productCount: { $addToSet: '$ProductID' }
      }
    },
    {
      $project: {
        _id: 0,
        category: { $ifNull: ['$_id', 'Uncategorized'] },
        revenue: { $round: ['$revenue', 2] },
        productCount: { $size: '$productCount' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
};

const getTopProducts = async (limit = 10) => {
  return await OrderDetail.aggregate([
    {
      $lookup: {
        from: 'products',
        let: { productId: '$ProductID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$ProductID' }, { $toString: '$$productId' }]
              }
            }
          }
        ],
        as: 'product'
      }
    },
    { $unwind: '$product' },
    lineTotalAddFields,
    {
      $group: {
        _id: '$product.ProductName',
        totalRevenue: { $sum: '$lineTotal' },
        totalQuantity: { $sum: '$Quantity' },
        orderCount: { $addToSet: '$OrderID' }
      }
    },
    {
      $project: {
        _id: 0,
        ProductName: '$_id',
        totalRevenue: { $round: ['$totalRevenue', 2] },
        totalQuantity: 1,
        orderCount: { $size: '$orderCount' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit }
  ]);
};

const getTopCustomers = async (limit = 10) => {
  return await OrderDetail.aggregate([
    orderLookup,
    { $unwind: '$order' },
    {
      $lookup: {
        from: 'customers',
        let: { customerId: '$order.CustomerID' },
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
    { $unwind: '$customer' },
    lineTotalAddFields,
    {
      $group: {
        _id: '$customer.CustomerID',
        CompanyName: { $first: '$customer.CompanyName' },
        Country: { $first: '$customer.Country' },
        totalSpent: { $sum: '$lineTotal' },
        orders: { $addToSet: '$OrderID' },
        lastOrderDate: { $max: '$order.OrderDate' }
      }
    },
    {
      $project: {
        _id: 0,
        CustomerID: '$_id',
        CompanyName: 1,
        Country: 1,
        totalSpent: { $round: ['$totalSpent', 2] },
        totalOrders: { $size: '$orders' },
        lastOrderDate: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit }
  ]);
};

const getRevenueByCountry = async () => {
  return await OrderDetail.aggregate([
    orderLookup,
    { $unwind: '$order' },
    lineTotalAddFields,
    {
      $group: {
        _id: '$order.ShipCountry',
        revenue: { $sum: '$lineTotal' },
        orderCount: { $addToSet: '$OrderID' }
      }
    },
    {
      $project: {
        _id: 0,
        country: '$_id',
        revenue: { $round: ['$revenue', 2] },
        orderCount: { $size: '$orderCount' }
      }
    },
    { $sort: { revenue: -1 } }
  ]);
};

const getLowStockProducts = async () => {
  return await Product.aggregate([
    {
      $match: {
        $expr: { $lte: ['$UnitsInStock', '$ReorderLevel'] },
        Discontinued: { $ne: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        ProductID: 1,
        ProductName: 1,
        UnitsInStock: 1,
        ReorderLevel: 1,
        UnitPrice: 1
      }
    },
    { $sort: { UnitsInStock: 1 } }
  ]);
};

const getAtRiskCustomers = async (daysSinceLastOrder = 90) => {
  return await OrderDetail.aggregate([
    orderLookup,
    { $unwind: '$order' },
    {
      $lookup: {
        from: 'customers',
        let: { customerId: '$order.CustomerID' },
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
    { $unwind: '$customer' },
    lineTotalAddFields,
    {
      $group: {
        _id: '$customer.CustomerID',
        CompanyName: { $first: '$customer.CompanyName' },
        ContactName: { $first: '$customer.ContactName' },
        Phone: { $first: '$customer.Phone' },
        lastOrderDate: { $max: '$order.OrderDate' },
        orders: { $addToSet: '$OrderID' },
        totalSpent: { $sum: '$lineTotal' }
      }
    },
    {
      $project: {
        _id: 0,
        CustomerID: '$_id',
        CompanyName: 1,
        ContactName: 1,
        Phone: 1,
        lastOrderDate: 1,
        totalOrders: { $size: '$orders' },
        totalSpent: { $round: ['$totalSpent', 2] }
      }
    },
    { $sort: { lastOrderDate: 1 } },
    { $limit: 20 }
  ]);
};

module.exports = {
  getSalesOverview,
  getRevenueByMonth,
  getRevenueByCategory,
  getTopProducts,
  getTopCustomers,
  getRevenueByCountry,
  getLowStockProducts,
  getAtRiskCustomers
};
