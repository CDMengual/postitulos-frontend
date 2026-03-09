import api from "@/shared/api/client";
import { Postitulo } from "@/features/postitulos/model/types";

interface GetPostituloResponse {
  success: boolean;
  message: string;
  data: Postitulo;
}

export async function getPostitulo(id: string) {
  const response = await api.get<GetPostituloResponse>(`/postitulos/${id}`);
  return response.data.data;
}
