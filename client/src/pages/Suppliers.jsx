import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import DataTable from '../components/DataTable';
import supplierService from '../services/supplierService';
import { getCountryFlag } from '../utils/formatters';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAll();
      setSuppliers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'CompanyName',
      label: 'Company',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCountryFlag(row.Country)}</span>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: 'ContactName', label: 'Contact' },
    { key: 'ContactTitle', label: 'Title' },
    { key: 'Country', label: 'Country' },
    { key: 'Phone', label: 'Phone' },
    {
      key: 'productCount',
      label: 'Products',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Suppliers</h2>
            <p className="text-sm text-slate-500">{suppliers.length} suppliers in the system</p>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        searchable
        emptyMessage="No suppliers found"
      />
    </div>
  );
}
