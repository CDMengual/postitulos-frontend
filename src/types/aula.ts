export interface Aula {
  id: number;
  numero: number;
  cohorte: number;
  nombre: string;
  codigo: string;
  postitulo?: {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  referentes?: { id: number; nombre: string; apellido: string }[];
  cursantesData?: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email?: string;
    celular?: number;
    region?: number;
    distrito?: string;
    titulo?: string;
  }[];
}
