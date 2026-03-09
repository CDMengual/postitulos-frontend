import { AulaCursanteRow, CursanteDetalleAula } from "@/features/cursantes/model/types";

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
  cursantes?: AulaCursanteRow[];
}

export interface AulaFormData {
  cohorteId: string;
  referenteId: number | "";
}

export interface AulaMassiveDistribution {
  referenteId: number | "";
  cantidad: number;
}

export interface AulaMassiveFormData {
  cohorteId: string;
  total: number;
  distribucion: AulaMassiveDistribution[];
}

export interface SignedDocumentoData {
  bucket: string;
  path: string;
  signedUrl: string;
  expiresIn: number;
}

export type AulaCursanteDetail = CursanteDetalleAula;
