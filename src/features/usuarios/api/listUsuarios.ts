import api from "@/shared/api/client";
import { User } from "@/features/usuarios/model/types";

interface ListUsuariosResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    total: number;
  };
}

export async function listUsuarios(): Promise<User[]> {
  const response = await api.get<ListUsuariosResponse>("/users");
  return response.data.data;
}
