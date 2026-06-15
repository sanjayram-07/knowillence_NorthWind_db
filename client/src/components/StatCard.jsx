import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'percentage',
  icon: Icon, 
  color = 'indigo', 
  loading = false,
  isCurrency = false,
  delay = 0
}) {
  const colorClasses = {
    indigo: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/25'
  };

  const isPositive = change > 0;
  const formattedValue = isCurrency ? formatCurrency(value) : formatNumber(value);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="skeleton h-4 w-24 rounded mb-3" />
            <div className="skeleton h-8 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
          <div className="skeleton w-12 h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {formattedValue}
          </motion.p>
          {change !== undefined && (
            <motion.div 
              className="flex items-center gap-1 mt-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-500" />
              )}
              <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}
