"use client";

import { useCallback, useState } from "react";
import { DashboardData } from "@/features/dashboard/model/types";
import { DashboardFilters, getDashboard } from "@/features/dashboard/api";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (filters?: DashboardFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboard(filters);
      setDashboard(data);
      return data;
    } catch {
      setDashboard(null);
      setError("No se pudo obtener el dashboard.");
      throw new Error("No se pudo obtener el dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboard,
    loading,
    error,
    loadDashboard,
    setError,
  };
}
