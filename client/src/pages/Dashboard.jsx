import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Bot, 
  RefreshCw,
  AlertTriangle,
  Package
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RevenueChart from '../components/charts/RevenueChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import useSales from '../hooks/useSales';
import productService from '../services/productService';
import aiService from '../services/aiService';
import { formatCurrency, getCountryFlag } from '../utils/formatters';

export default function Dashboard() {
  const { 
    overview, 
    revenueByMonth, 
    topProducts, 
    topCustomers, 
    loading 
  } = useSales();

  const [lowStock, setLowStock] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    productService.getLowStock().then(res => setLowStock(res.data || []));
    loadAISummary();
  }, []);

  const loadAISummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await aiService.getWeeklySummary();
      setAiSummary(res.data);
    } catch (err) {
      console.error('Failed to load AI summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={overview?.totalRevenue || 0}
          icon={DollarSign}
          color="indigo"
          loading={loading}
          isCurrency
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={overview?.totalOrders || 0}
          icon={ShoppingCart}
          color="green"
          loading={loading}
          delay={0.1}
        />
        <StatCard
          title="Total Customers"
          value={overview?.totalCustomers || 0}
          icon={Users}
          color="blue"
          loading={loading}
          delay={0.2}
        />
        <StatCard
          title="Avg Order Value"
          value={overview?.avgOrderValue || 0}
          icon={TrendingUp}
          color="purple"
          loading={loading}
          isCurrency
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueByMonth} loading={loading} />
        </div>
        
        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Customers</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : topCustomers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No customer data available</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.slice(0, 5).map((customer, index) => (
                <motion.div
                  key={customer.CustomerID}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCountryFlag(customer.Country)}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                        {customer.CompanyName}
                      </p>
                      <p className="text-xs text-slate-500">{customer.Country}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Products & AI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopProductsChart data={topProducts} loading={loading} />
        </div>

        {/* AI Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 shadow-lg shadow-primary-500/25 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">AI Weekly Insight</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={loadAISummary}
              disabled={summaryLoading}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>

          {summaryLoading ? (
            <div className="space-y-3">
              <div className="skeleton bg-white/20 h-4 w-full rounded" />
              <div className="skeleton bg-white/20 h-4 w-3/4 rounded" />
              <div className="skeleton bg-white/20 h-4 w-5/6 rounded" />
            </div>
          ) : aiSummary ? (
            <div className="space-y-4">
              <p className="text-sm text-white/90 leading-relaxed">
                {aiSummary.summary}
              </p>
              {aiSummary.actions?.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/20">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Actions</p>
                  <ul className="space-y-1.5">
                    {aiSummary.actions.slice(0, 3).map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/70">Click refresh to generate AI insights</p>
          )}
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Low Stock Alerts</h3>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
              {lowStock.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStock.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.ProductID}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {product.ProductName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Stock: <span className="font-semibold text-red-600">{product.UnitsInStock}</span>
                    {' / '}
                    Reorder: {product.ReorderLevel}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
