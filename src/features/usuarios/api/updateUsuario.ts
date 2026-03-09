import api from "@/shared/api/client";
import { UsuarioFormData } from "@/features/usuarios/model/types";

export async function updateUsuario(id: number, payload: UsuarioFormData) {
  const nextPayload = { ...payload };
  delete nextPayload.password;
  return api.patch(`/users/${id}`, nextPayload);
}
