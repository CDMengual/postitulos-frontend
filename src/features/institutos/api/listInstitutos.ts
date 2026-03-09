import api from "@/shared/api/client";
import { EditableInstituto } from "@/features/institutos/model/types";

interface ListInstitutosResponse {
  success: boolean;
  message: string;
  data: EditableInstituto[];
  meta: {
    total: number;
  };
}

export async function listInstitutos(): Promise<EditableInstituto[]> {
  const response = await api.get<ListInstitutosResponse>("/institutos");
  return response.data.data;
}
