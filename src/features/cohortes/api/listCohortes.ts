import api from "@/shared/api/client";
import { Cohorte } from "@/features/cohortes/model/types";

interface ListCohortesResponse {
  success: boolean;
  message: string;
  data: Cohorte[];
  meta?: {
    total: number;
  };
}

export interface ListCohortesFilters {
  estado?: string;
}

export async function listCohortes(filters?: ListCohortesFilters): Promise<Cohorte[]> {
  const params: Record<string, string> = {};

  if (filters?.estado && filters.estado !== "DEFAULT" && filters.estado !== "ALL") {
    params.estado = filters.estado;
  }

  const response = await api.get<ListCohortesResponse>("/cohortes", { params });
  return response.data.data;
}
