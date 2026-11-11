import { useEffect, useState } from "react";

interface DashboardQueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useDashboardQuery<T>(
  load: () => Promise<T>,
): DashboardQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void load()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard data.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [load]);

  return { data, error, loading };
}
