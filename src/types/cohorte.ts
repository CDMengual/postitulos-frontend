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
  cupos?: number;
  cuposListaEspera?: number;
  cuposTotales?: number;
  postitulo?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export interface CohortePublica {
  id: number;
  nombre: string;
  anio: number;

  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;

  postitulo: Postitulo & {
    destinatarios?: string | null;
    planEstudios?: string | null;
  };

  formulario: Formulario;
}
