import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { getMonthName, formatCurrency } from '../../utils/formatters';
import { usdToInr } from '../../utils/currency';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-3"
    >
      <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
      <p className="text-lg font-bold text-primary-600">
        {formatCurrency(payload[0].value)}
      </p>
      {payload[0].payload.orderCount && (
        <p className="text-xs text-slate-500 mt-1">
          {payload[0].payload.orderCount} orders
        </p>
      )}
    </motion.div>
  );
};

export default function RevenueChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="skeleton h-6 w-40 rounded mb-4" />
        <div className="skeleton h-[300px] rounded-xl" />
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    name: `${getMonthName(item.month).slice(0, 3)} ${item.year}`,
    revenue: Math.round(item.revenue)
  }));

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Over Time</h3>
        <p className="text-sm text-slate-400 text-center py-24">No revenue data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Revenue Over Time</h3>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-slate-500">Revenue</span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ea580c"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
