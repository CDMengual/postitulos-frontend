import api from "@/shared/api/client";
import { DocumentacionCursante } from "@/features/cursantes/model/types";

export async function updateAulaCursanteDocumentacion(
  aulaId: number,
  cursanteId: number,
  documentacion: DocumentacionCursante
) {
  await api.patch(`/aulas/${aulaId}/cursantes/${cursanteId}/documentacion`, {
    documentacion,
  });
}
