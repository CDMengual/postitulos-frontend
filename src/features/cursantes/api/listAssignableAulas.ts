import api from "@/shared/api/client";
import { Aula } from "@/features/aulas/model/types";

interface ListAssignableAulasResponse {
  success: boolean;
  message: string;
  data: Aula[];
}

export async function listAssignableAulas() {
  const response = await api.get<ListAssignableAulasResponse>("/aulas");
  return response.data.data ?? [];
}
