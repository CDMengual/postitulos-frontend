import api from "@/shared/api/client";
import { UsuarioFormData } from "@/features/usuarios/model/types";

export async function createUsuario(payload: UsuarioFormData) {
  return api.post("/users", payload);
}
