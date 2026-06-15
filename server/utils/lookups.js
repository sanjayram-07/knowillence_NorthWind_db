// Northwind MongoDB dumps often mix types (e.g. OrderID number in orderDetails, string in orders).
const orderLookup = {
  $lookup: {
    from: 'orders',
    let: { orderId: '$OrderID' },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: [{ $toString: '$OrderID' }, { $toString: '$$orderId' }]
          }
        }
      }
    ],
    as: 'order'
  }
};

const lineTotalAddFields = {
  $addFields: {
    lineTotal: {
      $multiply: [
        '$UnitPrice',
        '$Quantity',
        { $subtract: [1, { $ifNull: ['$Discount', 0] }] }
      ]
    }
  }
};

module.exports = { orderLookup, lineTotalAddFields };
