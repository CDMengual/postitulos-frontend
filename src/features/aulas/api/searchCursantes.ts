import api from "@/shared/api/client";
import { Cursante } from "@/features/cursantes/model/types";

interface SearchCursantesResponse {
  success: boolean;
  message: string;
  data: {
    cursantes: Cursante[];
  };
}

export async function searchCursantes(search: string, limit = 10): Promise<Cursante[]> {
  const response = await api.get<SearchCursantesResponse>("/cursantes", {
    params: { search, limit },
  });
  return response.data.data.cursantes;
}
