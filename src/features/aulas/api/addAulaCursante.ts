import api from "@/shared/api/client";
import { CursanteFormData } from "@/features/cursantes/model/types";

export async function addAulaCursante(
  aulaId: number,
  payload: { dni: string; aulaId: number } | (CursanteFormData & { aulaId: number })
) {
  await api.post(`/aulas/${aulaId}/cursantes`, payload);
}
