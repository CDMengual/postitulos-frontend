import api from "@/shared/api/client";
import { withCache } from "@/shared/lib/cache";
import { Distrito } from "@/features/institutos/model/types";

const DISTRITOS_CACHE_KEY = "distritos:list";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface ListDistritosResponse {
  data: Distrito[];
}

export async function listDistritos(): Promise<Distrito[]> {
  return withCache<Distrito[]>(
    DISTRITOS_CACHE_KEY,
    async () => {
      const response = await api.get<ListDistritosResponse>("/distritos");
      return response.data.data ?? [];
    },
    { ttl: ONE_WEEK_MS }
  );
}
