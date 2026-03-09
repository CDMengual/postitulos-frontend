import api from "@/shared/api/client";
import { InscripcionDetalle } from "@/features/inscripciones/model/types";

interface GetInscripcionResponse {
  success: boolean;
  message: string;
  data: InscripcionDetalle;
}

export async function getInscripcion(id: number | string): Promise<InscripcionDetalle> {
  const response = await api.get<GetInscripcionResponse>(`/inscripciones/${id}`);
  return response.data.data;
}
