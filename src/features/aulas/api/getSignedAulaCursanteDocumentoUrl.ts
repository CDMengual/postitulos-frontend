import api from "@/shared/api/client";
import { SignedDocumentoData } from "@/features/aulas/model/types";

interface GetSignedAulaCursanteDocumentoUrlResponse {
  success: boolean;
  data: SignedDocumentoData;
}

export async function getSignedAulaCursanteDocumentoUrl(
  aulaId: number,
  cursanteId: number,
  tipo: "dni" | "titulo",
  expiresIn = 600
) {
  const response = await api.get<GetSignedAulaCursanteDocumentoUrlResponse>(
    `/aulas/${aulaId}/cursantes/${cursanteId}/documentos/${tipo}/url`,
    { params: { expiresIn } }
  );

  return response.data.data;
}
