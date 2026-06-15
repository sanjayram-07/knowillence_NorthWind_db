import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import productService from '../services/productService';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import { usdToInr } from '../utils/currency';

export default function PointOfSale() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        productService.getAll({ page: 1, limit: 200, inStock: 'true' }),
        customerService.getAll(1, 200, '')
      ]);
      setProducts(productsRes.data || []);
      setCustomers(customersRes.data || []);
      if (customersRes.data?.[0]) {
        setCustomerId(customersRes.data[0].CustomerID);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.ProductName?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.ProductID === product.ProductID);
      if (existing) {
        if (existing.Quantity >= product.UnitsInStock) return prev;
        return prev.map((i) =>
          i.ProductID === product.ProductID ? { ...i, Quantity: i.Quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ProductID: product.ProductID,
          ProductName: product.ProductName,
          UnitPrice: product.UnitPrice,
          Quantity: 1,
          UnitsInStock: product.UnitsInStock
        }
      ];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.ProductID !== productId) return i;
          const next = i.Quantity + delta;
          if (next < 1) return null;
          if (next > i.UnitsInStock) return i;
          return { ...i, Quantity: next };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.ProductID !== productId));
  };

  const subtotalUsd = cart.reduce((s, i) => s + i.UnitPrice * i.Quantity, 0);
  const subtotalInr = usdToInr(subtotalUsd);

  const placeOrder = async () => {
    if (!customerId) {
      setError('Select a customer');
      return;
    }
    if (!cart.length) {
      setError('Cart is empty');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await orderService.create({
        CustomerID: customerId,
        items: cart.map((i) => ({
          ProductID: i.ProductID,
          Quantity: i.Quantity,
          UnitPrice: i.UnitPrice
        }))
      });
      setSuccess(res.data);
      setCart([]);
      loadCatalog();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Point of Sale</h2>
          <p className="text-sm text-slate-500">Select products · prices in INR</p>
        </div>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 rounded-xl text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Order #{success.order?.OrderID} placed — {formatCurrency(success.subtotal)}
          </motion.div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.ProductID}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="text-left p-3 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
              >
                <p className="font-medium text-sm text-slate-900 line-clamp-2 min-h-[2.5rem]">
                  {product.ProductName}
                </p>
                <p className="text-lg font-bold text-orange-600 mt-2">
                  {formatCurrency(product.UnitPrice)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Stock: {product.UnitsInStock}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col max-h-[calc(100vh-140px)]">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-slate-900">Current sale</h3>
          </div>

          <label className="text-xs font-medium text-slate-500 mb-1">Customer</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full mb-4 px-3 py-2 bg-slate-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-orange-500"
          >
            {customers.map((c) => (
              <option key={c.CustomerID} value={c.CustomerID}>
                {c.CompanyName} ({c.CustomerID})
              </option>
            ))}
          </select>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px]">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Tap products to add</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.ProductID}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.ProductName}</p>
                    <p className="text-xs text-orange-600 font-semibold">
                      {formatCurrency(item.UnitPrice * item.Quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQty(item.ProductID, -1)}
                      className="p-1 rounded-lg bg-white hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.Quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.ProductID, 1)}
                      className="p-1 rounded-lg bg-white hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.ProductID)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal (INR)</span>
              <span className="font-bold text-slate-900">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotalInr)}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={submitting || !cart.length}
              onClick={placeOrder}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Complete sale'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
