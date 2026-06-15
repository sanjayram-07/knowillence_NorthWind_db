import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  loading = false, 
  pagination,
  onPageChange,
  onSearch,
  searchValue,
  searchable = false,
  emptyMessage = 'No data found'
}) {
  const [localSearch, setLocalSearch] = useState('');
  const searchQuery = searchValue !== undefined ? searchValue : localSearch;
  const isServerSearch = typeof onSearch === 'function';

  const handleSearch = (e) => {
    const value = e.target.value;
    if (searchValue === undefined) {
      setLocalSearch(value);
    }
    onSearch?.(value);
  };

  const filteredData = searchable && searchQuery && !isServerSearch
    ? data.filter((row) =>
        columns.some((col) => {
          const raw = col.render ? row[col.key] : row[col.key];
          const text = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
          return text.toLowerCase().includes(searchQuery.toLowerCase());
        }) ||
        Object.values(row).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : data;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {searchable && (
          <div className="p-4 border-b border-slate-100">
            <div className="skeleton h-10 w-64 rounded-xl" />
          </div>
        )}
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col, i) => (
                <th
                  key={col.key || i}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <p className="text-slate-400">
                      {searchQuery && !isServerSearch ? 'No matches for your search' : emptyMessage}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIndex) => (
                  <motion.tr
                    key={row.CustomerID || row.ProductID || row.OrderID || row._id || rowIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: rowIndex * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-sm text-slate-700">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.pages} ({pagination.total} items)
          </p>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(pagination.pages)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
