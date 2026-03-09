import { Formulario } from "./formulario";
import { Postitulo } from "./postitulo";

export interface Cohorte {
  id: number;
  anio: number;
  nombre: string;
  fechaInicio: string;
  fechaFin?: string;
  fechaInicioInscripcion?: string;
  fechaFinInscripcion?: string;
  estado: string;
  cantidadAulas?: number;
  cantidadInscriptos?: number;
  cupos?: number;
  cuposListaEspera?: number;
  cuposTotales?: number;
  postitulo?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  formulario?: {
    id: number;
    nombre: string;
  } | null;
  institutos?: Array<{
    id: number;
    nombre: string;
    distritoId: number;
  }>;
}

export interface CohortePublica {
  id: number;
  nombre: string | null;
  anio: number;

  fechaInicioInscripcion: string | null;
  fechaFinInscripcion: string | null;

  cupos: number;
  cuposListaEspera: number;
  cuposTotales: number;
  inscriptosRegulares: number;
  inscriptosEspera: number;
  cuposDisponibles: number;
  cuposEsperaDisponibles: number;
  inscripcionHabilitada: boolean;
  enPeriodoInscripcion: boolean;
  fueraDePeriodoInscripcion: boolean;
  tieneCuposDisponibles: boolean;
  sinCuposDisponibles: boolean;

  postitulo: Pick<Postitulo, "id" | "nombre" | "codigo"> & {
    destinatarios: string | null;
    tipos?: Postitulo["tipos"];
    resolucion?: Postitulo["resolucion"];
    planEstudios?: Postitulo["planEstudios"];
    requisitos?: Postitulo["requisitos"];
  };

  formulario: Pick<Formulario, "id" | "nombre" | "campos"> | null;
}
