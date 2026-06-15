import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Truck,
  Bot,
  ChevronLeft,
  Store,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import FoxinLogo from '../components/FoxinLogo';

const adminNav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sales', icon: Store, label: 'Point of Sale' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/suppliers', icon: Truck, label: 'Suppliers' },
  { path: '/ai', icon: Bot, label: 'AI Assistant' }
];

const staffNav = [
  { path: '/sales', icon: Store, label: 'Point of Sale' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/ai', icon: Bot, label: 'AI Assistant' }
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const { isAdmin, user, logout } = useAuth();
  const navItems = isAdmin ? adminNav : staffNav;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 overflow-hidden"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <motion.div animate={{ opacity: sidebarOpen ? 1 : 0 }} className="overflow-hidden">
          <FoxinLogo size={36} showText={sidebarOpen} />
        </motion.div>
        {!sidebarOpen && (
          <img src="/foxin-logo.svg" alt="Foxin" className="w-9 h-9 rounded-lg mx-auto" />
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </motion.div>
        </motion.button>
      </div>

      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink to={item.path}>
                  <motion.div
                    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <AnimatePresence>
          {sidebarOpen && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-2 text-xs text-slate-400"
            >
              <p className="text-white font-medium">{user.name}</p>
              <p className="capitalize">{user.role}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
