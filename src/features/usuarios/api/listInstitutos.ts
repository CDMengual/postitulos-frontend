import api from "@/shared/api/client";
import { UsuarioFormInstitutoOption } from "@/features/usuarios/model/types";

interface ListInstitutosResponse {
  data: UsuarioFormInstitutoOption[];
}

export async function listInstitutos(): Promise<UsuarioFormInstitutoOption[]> {
  const response = await api.get<ListInstitutosResponse>("/institutos");
  return response.data.data;
}
