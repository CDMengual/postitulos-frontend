import api from "@/shared/api/client";
import {
  InscripcionesListData,
  ListInscripcionesFilters,
} from "@/features/inscripciones/model/types";

interface ListInscripcionesResponse {
  success: boolean;
  message: string;
  data: InscripcionesListData;
}

export async function listInscripciones(
  filters: ListInscripcionesFilters
): Promise<InscripcionesListData> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.cohorteId) params.cohorteId = filters.cohorteId;
  if (filters.estado) params.estado = filters.estado;
  if (filters.documentacion) params.documentacion = filters.documentacion;
  if (filters.search?.trim()) params.search = filters.search.trim();

  const response = await api.get<ListInscripcionesResponse>("/inscripciones", { params });
  return response.data.data;
}
