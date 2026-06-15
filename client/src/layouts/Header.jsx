import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const pageTitles = {
  '/': 'Dashboard',
  '/sales': 'Point of Sale',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/products': 'Products',
  '/suppliers': 'Suppliers',
  '/ai': 'AI Assistant'
};

export default function Header() {
  const location = useLocation();
  const { notifications, sidebarOpen } = useAppContext();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <motion.header
      initial={false}
      animate={{ marginLeft: sidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 left-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-40 flex items-center justify-between px-6"
    >
      {/* Title */}
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-slate-900"
      >
        {title}
      </motion.h1>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <Search className="w-4 h-4 text-slate-500" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          {notifications.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            >
              {notifications.length}
            </motion.span>
          )}
        </motion.button>

        {/* User */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25"
        >
          <User className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.header>
  );
}
