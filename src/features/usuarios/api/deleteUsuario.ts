import api from "@/shared/api/client";

export async function deleteUsuario(id: number) {
  return api.delete(`/users/${id}`);
}
