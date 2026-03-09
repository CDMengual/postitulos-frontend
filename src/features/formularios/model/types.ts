import { Postitulo } from "@/features/postitulos";
import { Cohorte } from "@/features/cohortes/model/types";

export interface CampoFormulario {
  id?: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "boolean"
    | "date"
    | "file"
    | "textarea";
  required?: boolean;
  options?: string[];
  multiple?: boolean;
  dynamic?: boolean;
  source?: string;
}

export interface Formulario {
  id: number;
  nombre: string;
  descripcion?: string;
  campos: CampoFormulario[];

  postitulo?: Postitulo;
  cohortes?: Cohorte[];

  createdAt?: string;
  updatedAt?: string;
}
