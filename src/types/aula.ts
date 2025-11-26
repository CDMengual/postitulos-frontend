import { Cursante, CursanteAula } from "./cursante";

export interface Aula {
  id: number;
  numero: number;
  codigo: string;
  nombre: string;
  cohorte: {
    id: number;
    nombre: string;
    anio: number;
    estado?: string;
    postitulo: {
      id: number;
      nombre: string;
      codigo: string;
    };
  };
  instituto?: {
    id: number;
    nombre: string;
  };
  referentes?: {
    id: number;
    nombre: string;
    apellido: string;
  }[];
  cursantes?: CursanteAula[];
}
