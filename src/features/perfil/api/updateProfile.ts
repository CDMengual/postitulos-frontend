import api from "@/shared/api/client";
import { User } from "@/features/usuarios/model/types";
import { ProfileForm } from "@/features/perfil/model/types";

export async function updateProfile(userId: number, form: ProfileForm) {
  const payload: Pick<User, "nombre" | "apellido" | "dni" | "email" | "celular"> = {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    dni: form.dni.trim(),
    email: form.email.trim(),
    celular: form.celular.trim(),
  };

  await api.patch(`/users/${userId}`, payload);

  return payload;
}
