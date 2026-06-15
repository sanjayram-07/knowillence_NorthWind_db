import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, Grid3X3, Plus, Pencil, Trash2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import productService from '../services/productService';
import { formatCurrency } from '../utils/formatters';

const emptyProductForm = {
  ProductName: '',
  CategoryID: '',
  SupplierID: '',
  QuantityPerUnit: '',
  UnitPrice: '',
  UnitsInStock: '',
  UnitsOnOrder: '',
  ReorderLevel: '',
  Discontinued: false
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ categoryId: '', lowStock: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes, categoriesRes] = await Promise.all([
        productService.getAll({ page: pagination.page, limit: pagination.limit, ...filters }),
        productService.getStats(),
        productService.getCategories()
      ]);
      setProducts(productsRes.data || []);
      setPagination(productsRes.pagination || pagination);
      setStats(statsRes.data);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyProductForm);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      ProductName: product.ProductName || '',
      CategoryID: product.CategoryID ?? '',
      SupplierID: product.SupplierID ?? '',
      QuantityPerUnit: product.QuantityPerUnit || '',
      UnitPrice: product.UnitPrice ?? '',
      UnitsInStock: product.UnitsInStock ?? '',
      UnitsOnOrder: product.UnitsOnOrder ?? '',
      ReorderLevel: product.ReorderLevel ?? '',
      Discontinued: product.Discontinued === 1
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        CategoryID: form.CategoryID || null,
        SupplierID: form.SupplierID || null
      };
      if (editingProduct) {
        await productService.update(editingProduct.ProductID, payload);
      } else {
        await productService.create(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.ProductName}"?`)) return;
    try {
      await productService.remove(product.ProductID);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: 'ProductName',
      label: 'Product',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'category',
      label: 'Category',
      render: (_, row) => (
        <span className="text-sm text-slate-600">{row.category?.CategoryName || 'N/A'}</span>
      )
    },
    {
      key: 'UnitPrice',
      label: 'Unit Price',
      render: (value) => (
        <span className="font-semibold text-primary-600">{formatCurrency(value || 0)}</span>
      )
    },
    {
      key: 'UnitsInStock',
      label: 'In Stock',
      render: (value, row) => (
        <span className={value <= row.ReorderLevel ? 'text-red-600 font-semibold' : ''}>
          {value}
        </span>
      )
    },
    { key: 'UnitsOnOrder', label: 'On Order' },
    { key: 'ReorderLevel', label: 'Reorder Level' },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        if (row.Discontinued === 1) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <XCircle className="w-3 h-3" />
              Discontinued
            </span>
          );
        }
        if (row.UnitsInStock <= row.ReorderLevel) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            In Stock
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-600"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">Manage your product catalog</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={stats?.total || 0} icon={Package} color="indigo" loading={loading} delay={0} />
        <StatCard title="Low Stock" value={stats?.lowStock || 0} icon={AlertTriangle} color="amber" loading={loading} delay={0.1} />
        <StatCard title="Discontinued" value={stats?.discontinued || 0} icon={XCircle} color="rose" loading={loading} delay={0.2} />
        <StatCard title="Categories" value={stats?.categories || 0} icon={Grid3X3} color="blue" loading={loading} delay={0.3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Category:</span>
            <select
              value={filters.categoryId}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, categoryId: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.CategoryID} value={cat.CategoryID}>
                  {cat.CategoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Stock:</span>
            {[
              { value: '', label: 'All' },
              { value: 'true', label: 'Low Stock' }
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, lowStock: option.value }));
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filters.lowStock === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage="No products found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
              <input
                required
                value={form.ProductName}
                onChange={(e) => setForm({ ...form, ProductName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.CategoryID}
                onChange={(e) => setForm({ ...form, CategoryID: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.CategoryID} value={cat.CategoryID}>
                    {cat.CategoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier ID</label>
              <input
                type="number"
                value={form.SupplierID}
                onChange={(e) => setForm({ ...form, SupplierID: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
              <input
                type="number"
                step="0.01"
                value={form.UnitPrice}
                onChange={(e) => setForm({ ...form, UnitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Per Unit</label>
              <input
                value={form.QuantityPerUnit}
                onChange={(e) => setForm({ ...form, QuantityPerUnit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Units In Stock</label>
              <input
                type="number"
                value={form.UnitsInStock}
                onChange={(e) => setForm({ ...form, UnitsInStock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Units On Order</label>
              <input
                type="number"
                value={form.UnitsOnOrder}
                onChange={(e) => setForm({ ...form, UnitsOnOrder: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={form.ReorderLevel}
                onChange={(e) => setForm({ ...form, ReorderLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="discontinued"
                checked={form.Discontinued}
                onChange={(e) => setForm({ ...form, Discontinued: e.target.checked })}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="discontinued" className="text-sm text-slate-700">Discontinued</label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
