import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/' : '/sales', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/' : '/sales', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 border border-orange-100"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/foxin-logo.svg" alt="Foxin" className="w-20 h-20 rounded-2xl shadow-lg shadow-orange-500/40 mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Foxin
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sales Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg text-center">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="admin or staff"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••"
              autoComplete="current-password"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600 text-center">Demo accounts</p>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50">
            <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700">Admin — full dashboard &amp; sales</p>
              <p>Username: <code className="text-orange-700">admin</code> · Password: <code className="text-orange-700">0730</code></p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
            <User className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-700">Staff — sales, orders &amp; AI</p>
              <p>Username: <code className="text-orange-700">staff</code> · Password: <code className="text-orange-700">0730</code></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
