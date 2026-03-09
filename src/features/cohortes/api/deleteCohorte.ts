import api from "@/shared/api/client";

export async function deleteCohorte(id: number) {
  return api.delete(`/cohortes/${id}`);
}
