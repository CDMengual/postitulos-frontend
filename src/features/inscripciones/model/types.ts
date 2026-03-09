export type EstadoInscripcionPrivada =
  | "PENDIENTE"
  | "ASIGNADA"
  | "LISTA_ESPERA"
  | "RECHAZADA";

export type DocumentacionInscripcion =
  | "VERIFICADA"
  | "PENDIENTE"
  | "NO_CORRESPONDE";

export const INSCRIPCION_ESTADOS: EstadoInscripcionPrivada[] = [
  "PENDIENTE",
  "ASIGNADA",
  "LISTA_ESPERA",
  "RECHAZADA",
];

export const INSCRIPCION_DOCUMENTACIONES: DocumentacionInscripcion[] = [
  "VERIFICADA",
  "PENDIENTE",
  "NO_CORRESPONDE",
];

export interface InscripcionCohorteRef {
  id: number;
  nombre: string;
  anio: number;
  estado: string;
  postitulo: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface InscripcionListadoItem {
  id: number;
  cohorteId: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  celular: string | null;
  estado: EstadoInscripcionPrivada;
  institutoId: number | null;
  prioridad: number | null;
  listaEspera: boolean;
  condicionada: boolean;
  documentacion: DocumentacionInscripcion;
  createdAt: string;
  updatedAt: string;
  cohorte: InscripcionCohorteRef;
  instituto: {
    id: number;
    nombre: string;
  } | null;
}

export interface InscripcionDetalle {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  celular: string | null;
  estado: EstadoInscripcionPrivada;
  documentacion: DocumentacionInscripcion;
  prioridad: number | null;
  listaEspera: boolean;
  condicionada: boolean;
  observaciones: string | null;
  datosFormulario: Record<string, unknown> | null;
  dniAdjuntoUrl: string | null;
  tituloAdjuntoUrl: string | null;
  cohorte: {
    id: number;
    nombre: string;
    anio: number;
    estado: string;
    fechaInicioInscripcion: string | null;
    fechaFinInscripcion: string | null;
    postitulo: {
      id: number;
      nombre: string;
      codigo: string;
    };
  };
}

export interface InscripcionesListData {
  inscriptos: InscripcionListadoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListInscripcionesFilters {
  page: number;
  limit: number;
  cohorteId?: string;
  estado?: string;
  documentacion?: string;
  search?: string;
}

export interface InstitutoOption {
  id: number;
  nombre: string;
  regionId: number | null;
}

export interface MassAssignmentDraft {
  inscriptoId: number;
  institutoId: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  regionId: number | null;
}

export interface SignedDocumentoData {
  bucket: string;
  path: string;
  signedUrl: string;
  expiresIn: number;
}
