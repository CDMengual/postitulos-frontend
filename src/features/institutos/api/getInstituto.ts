import api from "@/shared/api/client";
import { EditableInstituto } from "@/features/institutos/model/types";

interface GetInstitutoResponse {
  data: Partial<EditableInstituto>;
}

export async function getInstituto(id: number): Promise<Partial<EditableInstituto>> {
  const response = await api.get<GetInstitutoResponse>(`/institutos/${id}`);
  return response.data?.data ?? {};
}
