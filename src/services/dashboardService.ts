import api from "@/services/api";
import {
  DashboardApiResponse,
  DashboardData,
  DashboardDesgranamientoApiResponse,
  DashboardDesgranamientoRow,
} from "@/types/dashboard";

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

export async function getDashboardDesgranamiento(): Promise<DashboardDesgranamientoRow[]> {
  const response = await api.get<DashboardDesgranamientoApiResponse>("/dashboard/desgranamiento");
  return response.data.data.series;
}
