import api from "@/shared/api/client";

export interface CohorteFormData {
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  fechaInicioInscripcion?: string;
  fechaFinInscripcion?: string;
  postituloId: number | "";
  formularioId?: number | "";
  cupos: number | "";
  cuposListaEspera: number | "";
  institutoIds: number[];
}

export async function saveCohorte(payload: CohorteFormData, cohorteId?: number) {
  if (cohorteId) {
    return api.patch(`/cohortes/${cohorteId}`, payload);
  }

  return api.post("/cohortes", payload);
}
