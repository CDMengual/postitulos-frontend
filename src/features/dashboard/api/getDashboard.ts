import api from "@/shared/api/client";
import { DashboardApiResponse, DashboardData } from "@/features/dashboard/model/types";

export interface DashboardFilters {
  fechaDesde?: string;
  fechaHasta?: string;
}

export async function getDashboard(filters?: DashboardFilters): Promise<DashboardData> {
  const response = await api.get<DashboardApiResponse>("/dashboard", {
    params: filters,
  });
  return response.data.data;
}
