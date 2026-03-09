import api from "@/shared/api/client";
import { Cursante } from "@/features/cursantes/model/types";

interface ListCursantesResponse {
  success: boolean;
  message: string;
  data: {
    cursantes: Cursante[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function listCursantes(page: number, limit: number, search = "") {
  const params: Record<string, string | number> = { page, limit };

  if (search.trim()) {
    params.search = search.trim();
  }

  const response = await api.get<ListCursantesResponse>("/cursantes", { params });
  return response.data.data;
}
