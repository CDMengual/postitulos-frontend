export type EstadoInscripcion =
  | "INSCRIPTO"
  | "EN_REVISION"
  | "ADMITIDO"
  | "LISTA_ESPERA"
  | "RECHAZADO";

export type EstadoCursada = "ACTIVO" | "ADEUDA" | "BAJA";

export type EstadoCursante = EstadoInscripcion | EstadoCursada;
export type DocumentacionCursante = "VERIFICADA" | "PENDIENTE" | "NO_CORRESPONDE";

export interface Cursante {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  celular?: string | null;
  titulo?: string | null;
  regionId?: number | null;
  distritoId?: number | null;
  distrito?: {
    id: number;
    nombre: string;
    regionId: number | null;
  } | null;
  estadoInscripcion?: EstadoInscripcion;
  createdAt?: string;
  updatedAt?: string;
  // RelaciÃ³n explÃ­cita con aulas (cada inscripciÃ³n)
  inscripciones?: CursanteAula[];
}

export interface CursanteDetalleAula {
  cursante: Pick<
    Cursante,
    | "id"
    | "nombre"
    | "apellido"
    | "dni"
    | "email"
    | "celular"
    | "titulo"
    | "regionId"
    | "distritoId"
    | "distrito"
  >;
  inscripcionAula: {
    aulaId: number;
    aula?: {
      id: number;
      nombre: string;
      codigo: string;
      numero: number;
    } | null;
    cursanteId: number;
    estado: EstadoCursante;
    documentacion: DocumentacionCursante;
    observaciones?: string | null;
    dniAdjuntoUrl?: string | null;
    tituloAdjuntoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface AulaCursanteRow
  extends Pick<
    Cursante,
    | "id"
    | "nombre"
    | "apellido"
    | "dni"
    | "email"
    | "celular"
    | "titulo"
    | "regionId"
    | "distritoId"
  > {
  estado: EstadoCursante;
  documentacion: DocumentacionCursante;
  dniAdjuntoUrl?: string | null;
  tituloAdjuntoUrl?: string | null;
}

/**
 * Representa la relaciÃ³n entre un cursante y un aula.
 * Contiene el estado, documentaciÃ³n y observaciones especÃ­ficas de esa inscripciÃ³n.
 */
export interface CursanteAula {
  id: number;
  cursanteId: number;
  aulaId: number;
  estado: EstadoCursante;
  documentacion: DocumentacionCursante;
  observaciones?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Datos anidados opcionales
  cursante?: Cursante;
  aula?: AulaRef;
}

/** SimplificaciÃ³n del Aula que se usa dentro del cursante */
export interface AulaRef {
  id: number;
  nombre: string;
  numero: number;
  codigo: string;

  instituto: {
    id: number;
    nombre: string;
  };

  cohorte: {
    id: number;
    anio: number;
    nombre: string;
    estado: string;
    fechaInicio: string;
    fechaFin?: string | null;
    postitulo: {
      id: number;
      nombre: string;
      codigo: string;
    };
  };
}

