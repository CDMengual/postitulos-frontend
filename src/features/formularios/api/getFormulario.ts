import api from "@/shared/api/client";
import { Formulario } from "@/features/formularios/model/types";

interface GetFormularioResponse {
  success: boolean;
  message: string;
  data: Formulario;
}

export async function getFormulario(id: string | number): Promise<Formulario> {
  const response = await api.get<GetFormularioResponse>(`/formularios/${id}`);
  return response.data.data;
}
