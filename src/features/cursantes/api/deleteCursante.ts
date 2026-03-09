import api from "@/shared/api/client";

export async function deleteCursante(id: number) {
  await api.delete(`/cursantes/${id}`);
}
