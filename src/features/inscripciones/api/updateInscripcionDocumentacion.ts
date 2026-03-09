import api from "@/shared/api/client";
import { DocumentacionInscripcion } from "@/features/inscripciones/model/types";

export async function updateInscripcionDocumentacion(
  id: number,
  documentacion: DocumentacionInscripcion
): Promise<void> {
  await api.patch(`/inscripciones/${id}/documentacion`, { documentacion });
}
