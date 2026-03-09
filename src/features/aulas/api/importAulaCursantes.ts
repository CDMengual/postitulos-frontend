import api from "@/shared/api/client";
import { Cursante } from "@/features/cursantes/model/types";

interface ImportAulaCursantesResponse {
  success: boolean;
  message: string;
  data: {
    importados: Cursante[];
    duplicados: Cursante[];
  };
}

export async function importAulaCursantes(aulaId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ImportAulaCursantesResponse>(
    `/aulas/${aulaId}/cursantes/import`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data.data;
}
