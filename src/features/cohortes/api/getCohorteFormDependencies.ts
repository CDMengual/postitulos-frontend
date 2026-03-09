import api from "@/shared/api/client";
import { Formulario } from "@/features/formularios/model/types";
import { Instituto } from "@/features/institutos";
import { Postitulo } from "@/features/postitulos";

interface DataResponse<T> {
  data: T;
}

export async function getCohorteFormDependencies() {
  const [postitulosRes, formulariosRes, institutosRes] = await Promise.all([
    api.get<DataResponse<Postitulo[]>>("/postitulos"),
    api.get<DataResponse<Formulario[]>>("/formularios"),
    api.get<DataResponse<Instituto[]>>("/institutos"),
  ]);

  return {
    postitulos: postitulosRes.data.data,
    formularios: formulariosRes.data.data,
    institutos: institutosRes.data.data,
  };
}
