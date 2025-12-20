// ==========================================
// Custom Hook: useFetch
// Reusable hook untuk fetch data dari API
// ==========================================
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook untuk fetch data dari API
 * @param {Function} fetchFunction - Service function yang dipanggil
 * @param {Array} dependencies - Dependencies array untuk useEffect
 * @param {boolean} immediate - Langsung fetch atau tidak
 */
export const useFetch = (
  fetchFunction,
  dependencies = [],
  immediate = true
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch function wrapper
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result.data || result);
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  /**
   * Auto fetch saat component mount atau dependencies berubah
   */
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};
