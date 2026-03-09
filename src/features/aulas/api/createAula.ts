import api from "@/shared/api/client";
import { AulaFormData } from "@/features/aulas/model/types";

export async function createAula(form: AulaFormData) {
  await api.post("/aulass", form);
}
