import api from "@/shared/api/client";

export async function assignCursanteAula(cursanteId: number, aulaId: number) {
  await api.post(`/cursantes/${cursanteId}/asignar-aula`, { aulaId });
}
