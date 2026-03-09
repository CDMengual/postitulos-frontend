import api from "@/shared/api/client";
import { User } from "@/features/usuarios/model/types";

interface GetUsuarioResponse {
  success: boolean;
  message: string;
  data: User;
}

export async function getUsuario(id: string | number): Promise<User> {
  const response = await api.get<GetUsuarioResponse>(`/users/${id}`);
  return response.data.data;
}
