import api from "@/shared/api/client";

export async function updateCohorteEstado(id: number, estado: string) {
  return api.patch(`/cohortes/${id}/estado`, { estado });
}
