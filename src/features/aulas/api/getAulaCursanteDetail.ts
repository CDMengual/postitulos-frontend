import api from "@/shared/api/client";
import { AulaCursanteDetail } from "@/features/aulas/model/types";

interface GetAulaCursanteDetailResponse {
  success: boolean;
  message: string;
  data: AulaCursanteDetail;
}

export async function getAulaCursanteDetail(aulaId: number, cursanteId: number) {
  const response = await api.get<GetAulaCursanteDetailResponse>(
    `/aulas/${aulaId}/cursantes/${cursanteId}`
  );
  return response.data.data;
}
