import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../utils/api';

interface LazyDataOptions {
  pageSize?: number;
  cacheTime?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

interface LazyDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  total: number;
  page: number;
}

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  total: number;
  page: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

function useLazyData<T>(
  endpoint: string,
  options: LazyDataOptions = {}
): LazyDataResult<T> {
  const {
    pageSize = 20,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    refetchOnWindowFocus = true,
    enabled = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  const getCacheKey = useCallback((endpoint: string, page: number) => {
    return `${endpoint}_page_${page}_size_${pageSize}`;
  }, [pageSize]);

  const isDataStale = useCallback((timestamp: number) => {
    return Date.now() - timestamp > staleTime;
  }, [staleTime]);

  const fetchData = useCallback(async (pageNum: number, append = false) => {
    if (!enabled) return;

    const cacheKey = getCacheKey(endpoint, pageNum);
    const cachedEntry = cache.get(cacheKey);
    
    // Check if we have fresh cached data
    if (cachedEntry && !isDataStale(cachedEntry.timestamp)) {
      if (append) {
        setData(prev => [...prev, ...cachedEntry.data]);
      } else {
        setData(cachedEntry.data);
      }
      setTotal(cachedEntry.total);
      setHasMore(cachedEntry.data.length === pageSize);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest(endpoint, {
        method: 'GET',
        params: {
          page: pageNum,
          limit: pageSize,
        },
        signal: abortControllerRef.current.signal,
      });

      const newData = response.data || [];
      const newTotal = response.total || 0;
      
      // Cache the result
      cache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
        total: newTotal,
        page: pageNum,
      });

      // Clean up old cache entries
      for (const [key, entry] of cache.entries()) {
        if (Date.now() - entry.timestamp > cacheTime) {
          cache.delete(key);
        }
      }

      if (append) {
        setData(prev => [...prev, ...newData]);
      } else {
        setData(newData);
      }
      
      setTotal(newTotal);
      setHasMore(newData.length === pageSize && (page * pageSize) < newTotal);
      lastFetchTimeRef.current = Date.now();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, enabled, pageSize, getCacheKey, isDataStale, cacheTime, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  }, [loading, hasMore, page, fetchData]);

  const refresh = useCallback(() => {
    // Clear cache for this endpoint
    for (const key of cache.keys()) {
      if (key.startsWith(endpoint)) {
        cache.delete(key);
      }
    }
    
    setPage(1);
    setData([]);
    setHasMore(true);
    fetchData(1, false);
  }, [endpoint, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(1, false);
    }
  }, [enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      if (timeSinceLastFetch > staleTime) {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, staleTime, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
    page,
  };
}

export default useLazyData;