import api from "@/shared/api/client";
import { CohortePublica } from "@/features/cohortes/model/types";

interface ApiDataResponse<T> {
  data: T;
}

export async function listCohortesEnInscripcion(): Promise<CohortePublica[]> {
  const response = await api.get<ApiDataResponse<CohortePublica[]>>(
    "/public/cohortes-en-inscripcion"
  );
  return response.data.data;
}
