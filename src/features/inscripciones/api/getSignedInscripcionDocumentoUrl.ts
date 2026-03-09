import api from "@/shared/api/client";
import { SignedDocumentoData } from "@/features/inscripciones/model/types";

interface GetSignedInscripcionDocumentoUrlResponse {
  success: boolean;
  data: SignedDocumentoData;
}

export async function getSignedInscripcionDocumentoUrl(
  id: number,
  tipo: "dni" | "titulo",
  expiresIn = 600
): Promise<SignedDocumentoData> {
  const response = await api.get<GetSignedInscripcionDocumentoUrlResponse>(
    `/inscripciones/${id}/documentos/${tipo}/url`,
    { params: { expiresIn } }
  );

  return response.data.data;
}
