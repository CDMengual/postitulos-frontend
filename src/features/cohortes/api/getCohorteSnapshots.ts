import api from "@/shared/api/client";

export interface SnapshotAulaRef {
  id: number;
  nombre: string;
  codigo: string;
  numero: number;
}

export interface SnapshotSerieItem {
  fechaCorte: string;
  anio: number;
  mes: number;
  totalInicial: number;
  activos: number;
  adeuda: number;
  baja: number;
  finalizado: number;
  totalFoto: number;
}

interface SnapshotMensualResponse {
  success: boolean;
  message: string;
  data: {
    cohorteId: number;
    aulas: SnapshotAulaRef[];
    serie: SnapshotSerieItem[];
    snapshots: unknown[];
  };
}

export async function getCohorteSnapshots(cohorteId: number) {
  const response = await api.get<SnapshotMensualResponse>("/aulas/snapshots-mensuales", {
    params: { cohorteId },
  });

  return {
    aulas: response.data.data.aulas ?? [],
    serie: response.data.data.serie ?? [],
  };
}
