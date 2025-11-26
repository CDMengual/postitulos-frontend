export interface Postitulo {
  id: number;
  nombre: string;
  codigo?: string | null;
  destinatarios?: string | null;
  descripcion?: string | null;
  autores?: string | null;
  coordinadores?: string | null;
  resolucion?: string | null;
  planEstudios?: string | null;
  resolucionPuntaje?: string | null;
  dictamen?: string | null;
  modalidad?: string | null;
  cargaHoraria?: number | null;
  horasSincronicas?: number | null;
  horasVirtuales?: number | null;
  createdAt?: string;
  updatedAt?: string;
  tipos: PostituloTipo[];
}

export interface PostituloTipo {
  id: number;
  tipo: "ESPECIALIZACION" | "DIPLOMATURA" | "ACTUALIZACION";
  titulo: string;
  createdAt?: string;
  updatedAt?: string;
}
