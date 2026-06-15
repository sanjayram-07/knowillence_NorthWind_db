const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { getAtRiskCustomers } = require('../utils/aggregations');
const { createServiceError } = require('./serviceError');

const generateCustomerId = async (companyName) => {
  const base = (companyName || 'NEW')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 5)
    .toUpperCase()
    .padEnd(5, 'X');

  let candidate = base;
  let suffix = 0;

  while (await Customer.findOne({ CustomerID: candidate })) {
    suffix += 1;
    candidate = `${base.slice(0, 4)}${suffix}`.slice(0, 5);
  }

  return candidate;
};

const getAllCustomers = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const search = (query.q || '').trim();

  const matchStage = search
    ? {
        $or: [
          { CompanyName: { $regex: search, $options: 'i' } },
          { ContactName: { $regex: search, $options: 'i' } },
          { Country: { $regex: search, $options: 'i' } },
          { CustomerID: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const total = await Customer.countDocuments(matchStage);

  const customers = await Customer.aggregate([
    { $match: matchStage },
    { $sort: { CompanyName: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: 'orders',
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
        as: 'orders'
      }
    },
    {
      $lookup: {
        from: 'orderDetails',
        let: { orderIds: '$orders.OrderID' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [{ $toString: '$OrderID' }, { $map: { input: '$$orderIds', as: 'id', in: { $toString: '$$id' } } }]
              }
            }
          }
        ],
        as: 'lineItems'
      }
    },
    {
      $addFields: {
        totalOrders: { $size: '$orders' },
        lastOrderDate: { $max: '$orders.OrderDate' },
        totalSpent: {
          $round: [
            {
              $sum: {
                $map: {
                  input: '$lineItems',
                  as: 'item',
                  in: {
                    $multiply: [
                      '$$item.UnitPrice',
                      '$$item.Quantity',
                      { $subtract: [1, { $ifNull: ['$$item.Discount', 0] }] }
                    ]
                  }
                }
              }
            },
            2
          ]
        }
      }
    },
    {
      $project: {
        orders: 0,
        lineItems: 0
      }
    }
  ]);

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findOne({ CustomerID: id }).lean();
  if (!customer) {
    throw createServiceError(404, 'Customer not found');
  }

  const orders = await Order.find({ CustomerID: id })
    .sort({ OrderDate: -1 })
    .limit(10)
    .lean();

  return { ...customer, recentOrders: orders };
};

const getCustomerOrders = async (id) => {
  return Order.find({ CustomerID: id })
    .sort({ OrderDate: -1 })
    .lean();
};

const getAtRiskCustomersList = async () => getAtRiskCustomers(90);

const getCustomerStats = async () => {
  const total = await Customer.countDocuments();
  const atRiskData = await getAtRiskCustomers(90);

  return {
    total,
    atRiskCount: atRiskData.length,
    newThisMonth: 0
  };
};

const getCustomersWithStats = async (query = {}) => {
  return getAllCustomers({
    ...query,
    limit: query.limit || '200',
    page: query.page || '1'
  });
};

const createCustomer = async (payload = {}) => {
  const {
    CustomerID,
    CompanyName,
    ContactName,
    ContactTitle,
    Address,
    City,
    Region,
    PostalCode,
    Country,
    Phone,
    Fax
  } = payload;

  if (!CompanyName?.trim()) {
    throw createServiceError(400, 'Company name is required');
  }

  let id = CustomerID?.trim().toUpperCase();
  if (id) {
    const exists = await Customer.findOne({ CustomerID: id });
    if (exists) {
      throw createServiceError(400, 'Customer ID already exists');
    }
  } else {
    id = await generateCustomerId(CompanyName);
  }

  return Customer.create({
    CustomerID: id,
    CompanyName: CompanyName.trim(),
    ContactName: ContactName || '',
    ContactTitle: ContactTitle || '',
    Address: Address || '',
    City: City || '',
    Region: Region || '',
    PostalCode: PostalCode || '',
    Country: Country || '',
    Phone: Phone || '',
    Fax: Fax || ''
  });
};

const updateCustomer = async (id, payload = {}) => {
  const customer = await Customer.findOne({ CustomerID: id });

  if (!customer) {
    throw createServiceError(404, 'Customer not found');
  }

  const fields = [
    'CompanyName',
    'ContactName',
    'ContactTitle',
    'Address',
    'City',
    'Region',
    'PostalCode',
    'Country',
    'Phone',
    'Fax'
  ];

  fields.forEach((field) => {
    if (payload[field] !== undefined) {
      customer[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
    }
  });

  await customer.save();
  return customer;
};

const deleteCustomer = async (id) => {
  const orderCount = await Order.countDocuments({ CustomerID: id });
  if (orderCount > 0) {
    throw createServiceError(400, 'Cannot delete customer with existing orders');
  }

  const customer = await Customer.findOneAndDelete({ CustomerID: id });

  if (!customer) {
    throw createServiceError(404, 'Customer not found');
  }

  return { message: 'Customer deleted' };
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
