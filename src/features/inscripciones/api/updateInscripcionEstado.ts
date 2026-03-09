import api from "@/shared/api/client";
import { EstadoInscripcionPrivada } from "@/features/inscripciones/model/types";

export async function updateInscripcionEstado(
  id: number,
  estado: EstadoInscripcionPrivada
): Promise<void> {
  await api.patch(`/inscripciones/${id}/estado`, { estado });
}
