import api from "@/shared/api/client";
import { Cursante, CursanteFormData } from "@/features/cursantes/model/types";

function buildPayload(form: CursanteFormData) {
  return {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    dni: form.dni.trim(),
    email: form.email.trim() || null,
    celular: form.celular.trim() || null,
    titulo: form.titulo.trim() || null,
  };
}

export async function saveCursante(form: CursanteFormData, cursante?: Cursante | null) {
  const payload = buildPayload(form);

  if (cursante?.id) {
    await api.patch(`/cursantes/${cursante.id}`, payload);
    return;
  }

  await api.post("/cursantes", payload);
}
