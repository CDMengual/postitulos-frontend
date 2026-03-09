import api from "@/shared/api/client";
import { Cursante } from "@/features/cursantes/model/types";

interface GetCursanteResponse {
  success: boolean;
  message: string;
  data: Cursante;
}

export async function getCursante(id: number) {
  const response = await api.get<GetCursanteResponse>(`/cursantes/${id}`);
  return response.data.data;
}
