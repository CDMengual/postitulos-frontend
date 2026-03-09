import api from "@/shared/api/client";
import { Cohorte } from "@/features/cohortes/model/types";
import { Instituto } from "@/types/instituto";

interface GetCohorteResponse {
  success: boolean;
  message: string;
  data: Cohorte;
}

interface InstitutosResponse {
  success: boolean;
  message: string;
  data: Instituto[];
}

export async function getCohorte(id: string | number) {
  const [cohorteRes, institutosRes] = await Promise.all([
    api.get<GetCohorteResponse>(`/cohortes/${id}`),
    api.get<InstitutosResponse>("/institutos"),
  ]);

  const institutosMeta = (institutosRes.data.data || []).reduce<Record<number, Instituto>>(
    (acc, instituto) => {
      acc[instituto.id] = instituto;
      return acc;
    },
    {}
  );

  return {
    cohorte: cohorteRes.data.data,
    institutosMeta,
  };
}
