import { useState, useEffect, useCallback } from 'react';
import salesService from '../services/salesService';

export function useSales() {
  const [overview, setOverview] = useState(null);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
        monthlyRes,
        productsRes,
        customersRes,
        categoryRes
      ] = await Promise.all([
        salesService.getOverview(),
        salesService.getRevenueByMonth(),
        salesService.getTopProducts(10),
        salesService.getTopCustomers(10),
        salesService.getRevenueByCategory()
      ]);

      setOverview(overviewRes.data);
      setRevenueByMonth(monthlyRes.data || []);
      setTopProducts(productsRes.data || []);
      setTopCustomers(customersRes.data || []);
      setRevenueByCategory(categoryRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    overview,
    revenueByMonth,
    topProducts,
    topCustomers,
    revenueByCategory,
    loading,
    error,
    refetch: fetchData
  };
}

export default useSales;
