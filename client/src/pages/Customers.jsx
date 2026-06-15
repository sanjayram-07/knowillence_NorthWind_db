import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, UserPlus, X, Plus, Pencil, Trash2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import customerService from '../services/customerService';
import { formatCurrency, formatDate, getCountryFlag, truncateText } from '../utils/formatters';

const emptyCustomerForm = {
  CustomerID: '',
  CompanyName: '',
  ContactName: '',
  ContactTitle: '',
  Address: '',
  City: '',
  Region: '',
  PostalCode: '',
  Country: '',
  Phone: '',
  Fax: ''
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyCustomerForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [pagination.page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, statsRes] = await Promise.all([
        customerService.getAll(pagination.page, pagination.limit, search),
        customerService.getStats()
      ]);
      setCustomers(customersRes.data || []);
      if (customersRes.pagination) {
        setPagination((prev) => ({ ...prev, ...customersRes.pagination }));
      }
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (customer, e) => {
    e?.stopPropagation();
    setEditingCustomer(customer);
    setForm({
      CustomerID: customer.CustomerID || '',
      CompanyName: customer.CompanyName || '',
      ContactName: customer.ContactName || '',
      ContactTitle: customer.ContactTitle || '',
      Address: customer.Address || '',
      City: customer.City || '',
      Region: customer.Region || '',
      PostalCode: customer.PostalCode || '',
      Country: customer.Country || '',
      Phone: customer.Phone || '',
      Fax: customer.Fax || ''
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingCustomer) {
        const { CustomerID, ...payload } = form;
        await customerService.update(editingCustomer.CustomerID, payload);
      } else {
        await customerService.create(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete "${customer.CompanyName}"?`)) return;
    try {
      await customerService.remove(customer.CustomerID);
      if (drawerOpen && selectedCustomer?.CustomerID === customer.CustomerID) {
        setDrawerOpen(false);
      }
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRowClick = async (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
    try {
      const res = await customerService.getById(customer.CustomerID);
      setCustomerDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
    }
  };

  const columns = [
    {
      key: 'CompanyName',
      label: 'Company',
      render: (value, row) => (
        <button
          onClick={() => handleRowClick(row)}
          className="flex items-center gap-2 text-left hover:text-primary-600 transition-colors"
        >
          <span className="text-lg">{getCountryFlag(row.Country)}</span>
          <span className="font-medium">{truncateText(value, 25)}</span>
        </button>
      )
    },
    { key: 'ContactName', label: 'Contact' },
    { key: 'Country', label: 'Country' },
    {
      key: 'totalOrders',
      label: 'Orders',
      render: (value) => <span className="font-medium">{value || 0}</span>
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (value) => (
        <span className="font-semibold text-primary-600">{formatCurrency(value || 0)}</span>
      )
    },
    {
      key: 'lastOrderDate',
      label: 'Last Order',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => openEditModal(row, e)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-600"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(row, e)}
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
        <p className="text-slate-500 text-sm">Manage customer accounts</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Customers" value={stats?.total || 0} icon={Users} color="blue" loading={loading} delay={0} />
        <StatCard title="At Risk" value={stats?.atRiskCount || 0} icon={AlertTriangle} color="amber" loading={loading} delay={0.1} />
        <StatCard title="New This Month" value={stats?.newThisMonth || 0} icon={UserPlus} color="green" loading={loading} delay={0.2} />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchable
        searchValue={search}
        onSearch={handleSearch}
        pagination={pagination.pages > 1 ? pagination : null}
        onPageChange={handlePageChange}
        emptyMessage="No customers found"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
              form="customer-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingCustomer && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID (optional)</label>
                <input
                  value={form.CustomerID}
                  onChange={(e) => setForm({ ...form, CustomerID: e.target.value.toUpperCase() })}
                  maxLength={5}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            <div className={editingCustomer ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                required
                value={form.CompanyName}
                onChange={(e) => setForm({ ...form, CompanyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
              <input
                value={form.ContactName}
                onChange={(e) => setForm({ ...form, ContactName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Title</label>
              <input
                value={form.ContactTitle}
                onChange={(e) => setForm({ ...form, ContactTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                value={form.Address}
                onChange={(e) => setForm({ ...form, Address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                value={form.City}
                onChange={(e) => setForm({ ...form, City: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
              <input
                value={form.Region}
                onChange={(e) => setForm({ ...form, Region: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
              <input
                value={form.PostalCode}
                onChange={(e) => setForm({ ...form, PostalCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input
                value={form.Country}
                onChange={(e) => setForm({ ...form, Country: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                value={form.Phone}
                onChange={(e) => setForm({ ...form, Phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fax</label>
              <input
                value={form.Fax}
                onChange={(e) => setForm({ ...form, Fax: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border-0 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Customer Details</h2>
                  <div className="flex items-center gap-2">
                    {selectedCustomer && (
                      <button
                        type="button"
                        onClick={(e) => openEditModal(selectedCustomer, e)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDrawerOpen(false)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {customerDetails ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{getCountryFlag(customerDetails.Country)}</span>
                        <div>
                          <h3 className="font-semibold text-slate-900">{customerDetails.CompanyName}</h3>
                          <p className="text-sm text-slate-500">{customerDetails.ContactName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Title</p>
                          <p className="font-medium">{customerDetails.ContactTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Country</p>
                          <p className="font-medium">{customerDetails.Country}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">City</p>
                          <p className="font-medium">{customerDetails.City || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Phone</p>
                          <p className="font-medium">{customerDetails.Phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Recent Orders</h4>
                      {customerDetails.recentOrders?.length > 0 ? (
                        <div className="space-y-2">
                          {customerDetails.recentOrders.map((order) => (
                            <div
                              key={order.OrderID}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                            >
                              <div>
                                <p className="text-sm font-medium">Order #{order.OrderID}</p>
                                <p className="text-xs text-slate-500">{formatDate(order.OrderDate)}</p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  order.ShippedDate
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {order.ShippedDate ? 'Shipped' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No orders found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="skeleton h-32 rounded-xl" />
                    <div className="skeleton h-20 rounded-xl" />
                    <div className="skeleton h-20 rounded-xl" />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
