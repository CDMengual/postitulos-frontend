import api from "@/shared/api/client";

export interface PostituloTipoFormData {
  tipo: "ESPECIALIZACION" | "DIPLOMATURA" | "ACTUALIZACION";
  titulo: string;
}

export interface PostituloFormData {
  nombre: string;
  codigo: string;
  destinatarios: string;
  descripcion: string;
  autores: string;
  coordinadores: string;
  resolucion: string;
  resolucionPuntaje: string;
  dictamen: string;
  modalidad: string;
  cargaHoraria: number | "";
  horasSincronicas: number | "";
  horasVirtuales: number | "";
  tipos: PostituloTipoFormData[];
}

export async function savePostitulo(payload: PostituloFormData, id?: number) {
  if (id) {
    return api.patch(`/postitulos/${id}`, payload);
  }

  return api.post("/postitulos", payload);
}
