export type EstadoInscripcion =
  | "INSCRIPTO"
  | "EN_REVISION"
  | "ADMITIDO"
  | "LISTA_ESPERA"
  | "RECHAZADO";

export type EstadoCursada = "ACTIVO" | "ADEUDA" | "BAJA";

export type EstadoCursante = EstadoInscripcion | EstadoCursada;

export interface Cursante {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string | null;
  celular?: string | null;
  titulo?: string | null;
  estadoInscripcion?: EstadoInscripcion;
  createdAt?: string;
  updatedAt?: string;
  // Relación explícita con aulas (cada inscripción)
  inscripciones: CursanteAula[];
}

/**
 * Representa la relación entre un cursante y un aula.
 * Contiene el estado, documentación y observaciones específicas de esa inscripción.
 */
export interface CursanteAula {
  id: number;
  cursanteId: number;
  aulaId: number;
  estado: EstadoCursante;
  documentacion: "VERIFICADA" | "PENDIENTE" | "NO_CORRESPONDE";
  observaciones?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Datos anidados opcionales
  cursante?: Cursante;
  aula?: AulaRef;
}

/** Simplificación del Aula que se usa dentro del cursante */
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
