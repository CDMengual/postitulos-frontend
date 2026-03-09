import api from "@/shared/api/client";
import { Aula } from "@/features/aulas/model/types";

interface GetAulaResponse {
  success: boolean;
  message: string;
  data: Aula;
}

export async function getAula(id: number | string): Promise<Aula> {
  const response = await api.get<GetAulaResponse>(`/aulas/${id}`);
  return response.data.data;
}
