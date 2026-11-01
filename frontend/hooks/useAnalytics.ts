import { useState, useEffect } from 'react';

export interface AnalyticsData {
  kpis: {
    totalVisitors: number;
    pageViews: number;
    avgSessionDuration: string;
    bounceRate: string;
  };
  deviceTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topPages: {
    url: string;
    views: number;
  }[];
  chartData?: {
    date: string;
    visitors: number;
    pageviews: number;
    sessions: number;
  }[];
  rageClickSessionsCount?: number;
  trafficSources?: {
    source: string;
    type: string;
    visitors: number;
    convRate: number;
    color: string;
  }[];
  funnel?: {
    step: string;
    visitors: number;
    percentage: number;
    dropoff: number;
  }[];
}

/**
 * Custom React Hook to fetch aggregated dashboard analytics overview
 * from the Node.js/Express backend.
 * 
 * @param projectId - The unique identifier of the project to monitor
 * @param range - The time range filter (e.g., '7d', '30d', '90d')
 */
export function useAnalytics(projectId: string, range: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Wait until a real projectId is available (context may still be loading)
    if (!projectId) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const { signal } = controller;

    const fetchUrl = `http://localhost:5000/api/analytics/overview?projectId=${encodeURIComponent(
      projectId
    )}&range=${encodeURIComponent(range)}`;

    fetch(fetchUrl, { signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          if (json.success) {
            setData(json.data);
          } else {
            throw new Error(json.error || 'Failed to fetch analytics');
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== 'AbortError') {
          console.error('[useAnalytics hook error]:', err);
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [projectId, range]);

  return { data, isLoading, error };
}
