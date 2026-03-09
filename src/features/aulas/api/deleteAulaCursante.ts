import api from "@/shared/api/client";

export async function deleteAulaCursante(aulaId: number, cursanteId: number) {
  await api.delete(`/aulas/${aulaId}/cursantes/${cursanteId}`);
}
