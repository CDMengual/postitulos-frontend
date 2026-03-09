import api from "@/shared/api/client";
import { AulaMassiveFormData } from "@/features/aulas/model/types";

interface CreateAulasMassiveResponse {
  success: boolean;
  message: string;
}

export async function createAulasMassive(form: AulaMassiveFormData): Promise<string> {
  const response = await api.post<CreateAulasMassiveResponse>("/aulas/massive", {
    cohorteId: form.cohorteId,
    total: form.total,
    distribucion: form.distribucion.map((item) => ({
      referenteId: item.referenteId,
      cantidad: item.cantidad,
    })),
  });

  return response.data.message || "Aulas creadas correctamente";
}
