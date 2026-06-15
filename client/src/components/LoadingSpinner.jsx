import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  };

  const spinner = (
    <motion.div
      className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <motion.p 
            className="text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading...
          </motion.p>
        </div>
      </div>
    );
  }

  return spinner;
}
