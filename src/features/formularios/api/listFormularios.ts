import api from "@/shared/api/client";
import { Formulario } from "@/features/formularios/model/types";

interface ListFormulariosResponse {
  success: boolean;
  message: string;
  data: Formulario[];
  meta?: {
    total: number;
  };
}

export async function listFormularios(): Promise<Formulario[]> {
  const response = await api.get<ListFormulariosResponse>("/formularios");
  return response.data.data;
}
