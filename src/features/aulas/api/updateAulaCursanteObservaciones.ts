import api from "@/shared/api/client";
import { AulaCursanteDetail } from "@/features/aulas/model/types";

interface UpdateAulaCursanteObservacionesResponse {
  success: boolean;
  message: string;
  data:
    | AulaCursanteDetail["inscripcionAula"]
    | {
        inscripcionAula: AulaCursanteDetail["inscripcionAula"];
      };
}

export async function updateAulaCursanteObservaciones(
  aulaId: number,
  cursanteId: number,
  observaciones: string
) {
  const response = await api.patch<UpdateAulaCursanteObservacionesResponse>(
    `/aulas/${aulaId}/cursantes/${cursanteId}`,
    { observaciones }
  );

  return "inscripcionAula" in response.data.data
    ? response.data.data.inscripcionAula
    : response.data.data;
}
