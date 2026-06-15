import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../context/AppContext';

export default function MainLayout({ children }) {
  const { sidebarOpen } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <Header />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
