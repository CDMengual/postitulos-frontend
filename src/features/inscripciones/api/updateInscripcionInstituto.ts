import api from "@/shared/api/client";

export async function updateInscripcionInstituto(
  id: number,
  institutoId: number | null
): Promise<void> {
  await api.patch(`/inscripciones/${id}/instituto`, { institutoId });
}
