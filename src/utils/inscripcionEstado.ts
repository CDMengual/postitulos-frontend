import { Cursante, EstadoInscripcion } from "@/types/cursante";

const ESTADOS_INSCRIPCION: EstadoInscripcion[] = [
  "INSCRIPTO",
  "EN_REVISION",
  "ADMITIDO",
  "LISTA_ESPERA",
  "RECHAZADO",
];

export function isEstadoInscripcion(value?: string | null): value is EstadoInscripcion {
  if (!value) return false;
  return ESTADOS_INSCRIPCION.includes(value as EstadoInscripcion);
}

export function getEstadoInscripcionCursante(cursante: Cursante): EstadoInscripcion {
  if (isEstadoInscripcion(cursante.estadoInscripcion)) {
    return cursante.estadoInscripcion;
  }

  const estadoDesdeInscripcion = (cursante.inscripciones ?? []).find((insc) =>
    isEstadoInscripcion(insc.estado)
  )?.estado;

  return isEstadoInscripcion(estadoDesdeInscripcion)
    ? estadoDesdeInscripcion
    : "INSCRIPTO";
}
