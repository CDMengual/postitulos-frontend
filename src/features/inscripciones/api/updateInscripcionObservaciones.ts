import api from "@/shared/api/client";

export async function updateInscripcionObservaciones(
  id: number,
  observaciones: string
): Promise<void> {
  await api.patch(`/inscripciones/${id}`, { observaciones });
}
