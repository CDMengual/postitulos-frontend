import api from "@/shared/api/client";
import { Cohorte } from "@/features/cohortes/model/types";
import { User } from "@/features/usuarios/model/types";

interface DataResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getAulaFormDependencies() {
  const [cohortesRes, referentesRes] = await Promise.all([
    api.get<DataResponse<Cohorte[]>>("/cohortes"),
    api.get<DataResponse<User[]>>("/users?rol=REFERENTE"),
  ]);

  return {
    cohortes: cohortesRes.data.data,
    referentes: referentesRes.data.data,
  };
}
