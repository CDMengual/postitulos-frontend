import api from "@/shared/api/client";
import { Aula } from "@/features/aulas/model/types";

interface ListAulasResponse {
  success: boolean;
  message: string;
  data: Aula[];
}

export interface ListAulasFilters {
  estado?: string;
  postituloId?: string;
}

export async function listAulas(filters?: ListAulasFilters): Promise<Aula[]> {
  const params: Record<string, string> = {};

  if (filters?.estado) {
    params.estado = filters.estado;
  }

  if (filters?.postituloId) {
    params.postituloId = filters.postituloId;
  }

  const response = await api.get<ListAulasResponse>("/aulas", { params });
  return response.data.data;
}
