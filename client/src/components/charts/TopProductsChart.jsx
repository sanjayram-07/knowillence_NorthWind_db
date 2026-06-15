import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency, truncateText } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-3"
    >
      <p className="text-sm font-medium text-slate-900 mb-1">{data.ProductName}</p>
      <p className="text-lg font-bold text-primary-600">{formatCurrency(data.totalRevenue)}</p>
      <p className="text-xs text-slate-500 mt-1">{data.totalQuantity} units sold</p>
    </motion.div>
  );
};

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

export default function TopProductsChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="skeleton h-6 w-48 rounded mb-4" />
        <div className="skeleton h-[300px] rounded-xl" />
      </div>
    );
  }

  const chartData = data.slice(0, 5).map(item => ({
    ...item,
    name: truncateText(item.ProductName, 15)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Top Products by Revenue</h3>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => {
                const inr = value * 83.5;
                return `₹${(inr / 1000).toFixed(0)}k`;
              }}
            />
            <YAxis 
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar 
              dataKey="totalRevenue" 
              radius={[0, 8, 8, 0]}
              barSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
