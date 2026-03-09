import api from "@/shared/api/client";

export async function deletePostitulo(id: number) {
  return api.delete(`/postitulos/${id}`);
}
