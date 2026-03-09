import api from "@/shared/api/client";
import { EstadoCursante } from "@/features/cursantes/model/types";

export async function updateAulaCursanteEstado(
  aulaId: number,
  cursanteId: number,
  estado: EstadoCursante
) {
  await api.patch(`/aulas/${aulaId}/cursantes/${cursanteId}/estado`, { estado });
}
