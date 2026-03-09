import { getInstituto } from "@/features/institutos/api/getInstituto";
import { listDistritos } from "@/features/institutos/api/listDistritos";
import { Distrito, EditableInstituto } from "@/features/institutos/model/types";

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

function findDistritoId(instituto: Partial<EditableInstituto>, distritos: Distrito[]) {
  const nombre = instituto.distritoNombre;
  if (!nombre) return null;

  const normalizedName = normalizeText(nombre);
  const regionId =
    instituto.regionId === null || instituto.regionId === undefined ? null : Number(instituto.regionId);

  const matched = distritos.find((distrito) => {
    const sameName = normalizeText(distrito.nombre) === normalizedName;
    if (!sameName) return false;
    if (regionId === null || Number.isNaN(regionId)) return true;
    return Number(distrito.regionId) === regionId;
  });

  return matched?.id ?? null;
}

export async function resolveEditableInstituto(instituto: EditableInstituto): Promise<EditableInstituto> {
  const directDistritoId = typeof instituto.distritoId === "number" ? instituto.distritoId : null;
  if (directDistritoId !== null) {
    return { ...instituto, distritoId: directDistritoId };
  }

  try {
    const detail = await getInstituto(instituto.id);
    const detailDistritoId = typeof detail.distritoId === "number" ? detail.distritoId : null;

    if (detailDistritoId !== null) {
      return { ...instituto, ...detail, distritoId: detailDistritoId };
    }
  } catch {
    // Fallback al mapeo por nombre y region si no hay detalle disponible.
  }

  try {
    const distritos = await listDistritos();
    return { ...instituto, distritoId: findDistritoId(instituto, distritos) };
  } catch {
    return instituto;
  }
}
