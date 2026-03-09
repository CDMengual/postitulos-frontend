import api from "@/shared/api/client";

interface MassInscripcionInstitutoAssignment {
  inscriptoId: number;
  institutoId: number | null;
}

export async function applyMassInscripcionInstitutoAssignment(
  asignaciones: MassInscripcionInstitutoAssignment[]
): Promise<void> {
  await api.patch("/inscripciones/institutos/asignacion-masiva", { asignaciones });
}
