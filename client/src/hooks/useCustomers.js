import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersRes, statsRes] = await Promise.all([
        customerService.getWithStats(),
        customerService.getStats()
      ]);

      setCustomers(customersRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCustomers = useCallback(async (query) => {
    try {
      setLoading(true);
      const res = await customerService.getAll(1, 50, query);
      setCustomers(res.data || []);
      setPagination(res.pagination || pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    stats,
    pagination,
    search,
    setSearch,
    searchCustomers,
    loading,
    error,
    refetch: fetchCustomers
  };
}

export default useCustomers;
