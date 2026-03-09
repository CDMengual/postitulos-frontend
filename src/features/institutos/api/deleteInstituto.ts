import api from "@/shared/api/client";

export async function deleteInstituto(id: number) {
  return api.delete(`/institutos/${id}`);
}
