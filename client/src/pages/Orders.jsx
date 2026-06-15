import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getAll({ page: pagination.page, limit: pagination.limit, ...filters }),
        orderService.getStats()
      ]);
      setOrders(ordersRes.data || []);
      setPagination(ordersRes.pagination || pagination);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      key: 'OrderID',
      label: 'Order ID',
      render: (value) => (
        <span className="font-mono text-sm font-medium">#{value}</span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (_, row) => (
        <span className="text-sm">{row.customer?.CompanyName || row.CustomerID}</span>
      )
    },
    {
      key: 'OrderDate',
      label: 'Order Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'ShippedDate',
      label: 'Shipped Date',
      render: (value) => value ? formatDate(value) : '-'
    },
    {
      key: 'ShipCountry',
      label: 'Ship To'
    },
    {
      key: 'orderTotal',
      label: 'Order Total',
      render: (value, row) => (
        <span className="font-semibold text-orange-600">
          {formatCurrency(value ?? row.subtotal ?? 0)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          row.ShippedDate 
            ? 'bg-green-100 text-green-700' 
            : 'bg-amber-100 text-amber-700'
        }`}>
          {row.ShippedDate ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Shipped
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              Pending
            </>
          )}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Today"
          value={stats?.todayCount || 0}
          icon={ShoppingCart}
          color="indigo"
          loading={loading}
          delay={0}
        />
        <StatCard
          title="This Week"
          value={stats?.thisWeekCount || 0}
          icon={ShoppingCart}
          color="blue"
          loading={loading}
          delay={0.1}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingCount || 0}
          icon={Clock}
          color="amber"
          loading={loading}
          delay={0.2}
        />
        <StatCard
          title="Avg Order Value"
          value={stats?.avgOrderValue || stats?.avgFreight || 0}
          icon={DollarSign}
          color="green"
          loading={loading}
          isCurrency
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Status:</span>
          <div className="flex gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'shipped', label: 'Shipped' }
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filters.status === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage="No orders found"
      />
    </div>
  );
}
