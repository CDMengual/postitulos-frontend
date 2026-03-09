import api from "@/shared/api/client";

export async function deleteFormulario(id: number) {
  return api.delete(`/formularios/${id}`);
}
