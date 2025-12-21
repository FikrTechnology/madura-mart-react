// ==========================================
// Custom Hook: useFetch
// Handle data fetching dengan loading dan error states
// ==========================================
import { useState, useCallback } from 'react';

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook untuk fetch data dari API dengan loading dan error handling
 * @param fetchFn - Function yang melakukan fetch
 * @returns Object dengan data, loading, error, dan refetch
 */
export const useFetch = <T,>(
  fetchFn: () => Promise<T>
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError((err as Error).message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Auto-fetch on mount
  useCallback(() => {
    refetch();
  }, [refetch])();

  return { data, loading, error, refetch };
};
