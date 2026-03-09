import api from "@/shared/api/client";
import { Instituto } from "@/features/institutos";

interface ListInscripcionInstitutosResponse {
  data: Instituto[];
}

export async function listInscripcionInstitutos(): Promise<Instituto[]> {
  const response = await api.get<ListInscripcionInstitutosResponse>("/institutos");
  return response.data.data;
}
