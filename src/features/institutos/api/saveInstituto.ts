import api from "@/shared/api/client";

export interface InstitutoFormData {
  nombre: string;
  distritoId: number | null;
}

export async function saveInstituto(payload: InstitutoFormData, id?: number) {
  const nextPayload = {
    nombre: payload.nombre.trim(),
    distritoId: payload.distritoId,
  };

  if (id) {
    return api.patch(`/institutos/${id}`, nextPayload);
  }

  return api.post("/institutos", nextPayload);
}
