import api from "@/shared/api/client";
import {
  DashboardDesgranamientoApiResponse,
  DashboardDesgranamientoRow,
} from "@/features/dashboard/model/types";

export async function getDashboardDesgranamiento(): Promise<DashboardDesgranamientoRow[]> {
  const response = await api.get<DashboardDesgranamientoApiResponse>("/dashboard/desgranamiento");
  return response.data.data.series;
}
