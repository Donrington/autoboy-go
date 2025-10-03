import { useState, useEffect, useCallback } from 'react';
import { handleAPIError } from '../services/api';

// Generic hook for API calls with loading and error states
export const useAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for API calls that need manual triggering
export const useAsyncAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const error = handleAPIError(err);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
};

export default useAPI;