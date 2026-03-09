import api from "@/shared/api/client";

export interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}

interface ListDistritosResponse {
  data: Distrito[];
}

export async function listDistritos(): Promise<Distrito[]> {
  const response = await api.get<ListDistritosResponse>("/distritos");
  return response.data.data;
}
