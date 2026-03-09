import api from "@/shared/api/client";
import { Postitulo } from "@/features/postitulos/model/types";

interface ListPostitulosResponse {
  success: boolean;
  message: string;
  data: Postitulo[];
  meta?: {
    total?: number;
  };
}

export async function listPostitulos(): Promise<Postitulo[]> {
  const response = await api.get<ListPostitulosResponse>("/postitulos");
  return response.data.data;
}
