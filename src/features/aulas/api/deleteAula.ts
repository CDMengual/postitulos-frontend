import api from "@/shared/api/client";

export async function deleteAula(id: number) {
  await api.delete(`/aulas/${id}`);
}
