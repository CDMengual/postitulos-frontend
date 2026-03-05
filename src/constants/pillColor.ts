import { ChipProps } from "@mui/material";

export const postituloTypes: Record<string, { label: string; color: ChipProps["color"] }> = {
  ESPECIALIZACION: { label: "Especialización", color: "info" },
  DIPLOMATURA: { label: "Diplomatura", color: "secondary" },
  ACTUALIZACION: { label: "Actualización", color: "warning" },
  DEFAULT: { label: "Otro", color: "default" },
};

export function getPostituloTypeMeta(tipo?: string) {
  if (!tipo) return postituloTypes.DEFAULT;
  return postituloTypes[tipo] || postituloTypes.DEFAULT;
}

export const estadoCursanteMeta: Record<
  string,
  { label: string; color: ChipProps["color"] | string }
> = {
  INSCRIPTO: { label: "Inscripto", color: "info" },
  EN_REVISION: { label: "En revision", color: "warning" },
  ADMITIDO: { label: "Admitido", color: "success" },
  LISTA_ESPERA: { label: "Lista de espera", color: "warning" },
  RECHAZADO: { label: "Rechazado", color: "error" },
  ACTIVO: { label: "Activo", color: "success" },
  ADEUDA: { label: "Adeuda", color: "warning" },
  BAJA: { label: "Baja", color: "error" },
  DEFAULT: { label: "Sin estado", color: "default" },
};

export function getEstadoCursanteMeta(estado?: string) {
  if (!estado) return estadoCursanteMeta.DEFAULT;
  return estadoCursanteMeta[estado] || estadoCursanteMeta.DEFAULT;
}

export const estadoInscripcionPrivadaMeta: Record<
  string,
  { label: string; color: ChipProps["color"] | string }
> = {
  PENDIENTE: { label: "Pendiente", color: "#f5b301" },
  ASIGNADA: { label: "Asignada", color: "success" },
  LISTA_ESPERA: { label: "Lista de espera", color: "info" },
  RECHAZADA: { label: "Rechazada", color: "error" },
  DEFAULT: { label: "Sin estado", color: "default" },
};

export function getEstadoInscripcionPrivadaMeta(estado?: string) {
  if (!estado) return estadoInscripcionPrivadaMeta.DEFAULT;
  return estadoInscripcionPrivadaMeta[estado] || estadoInscripcionPrivadaMeta.DEFAULT;
}

export const documentacionCursanteMeta: Record<
  string,
  { label: string; color: ChipProps["color"] | string }
> = {
  VERIFICADA: { label: "Verificada", color: "success" },
  PENDIENTE: { label: "Pendiente", color: "#f5b301" },
  NO_CORRESPONDE: { label: "No corresponde", color: "error" },
  DEFAULT: { label: "Sin dato", color: "default" },
};

export function getDocumentacionCursanteMeta(estado?: string) {
  if (!estado) return documentacionCursanteMeta.DEFAULT;
  return documentacionCursanteMeta[estado] || documentacionCursanteMeta.DEFAULT;
}

export const rolMeta: Record<string, { label: string; color: ChipProps["color"] | string }> = {
  ADMIN: { label: "ADMIN", color: "primary" },
  REFERENTE: { label: "REFE", color: "warning" },
  DEFAULT: { label: "-", color: "default" },
};

export function getRolMeta(rol?: string) {
  if (!rol) return rolMeta.DEFAULT;
  return rolMeta[rol] || rolMeta.DEFAULT;
}

export const estadoCohorteMeta: Record<
  string,
  { label: string; color: ChipProps["color"] | string }
> = {
  ACTIVA: { label: "Activa", color: "success" },
  INSCRIPCION: { label: "Inscripción", color: "warning" },
  INACTIVA: { label: "Inactiva", color: "default" },
  CANCELADA: { label: "Cancelada", color: "error" },
  FINALIZADA: { label: "Finalizada", color: "info" },
  DEFAULT: { label: "-", color: "default" },
};

export function getEstadoCohorteMeta(estado?: string) {
  if (!estado) return estadoCohorteMeta.DEFAULT;
  return estadoCohorteMeta[estado] || estadoCohorteMeta.DEFAULT;
}
