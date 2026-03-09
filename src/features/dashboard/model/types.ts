import { UserRole } from "@/features/usuarios/model/types";

export type DashboardScope = "global" | "user";

export type DashboardCohorteEstado =
  | "INSCRIPCION"
  | "ACTIVA"
  | "INACTIVA"
  | "FINALIZADA"
  | "CANCELADA";

export interface DashboardAlcance {
  scope: DashboardScope;
  userId: number;
  rol: UserRole | string;
}

export interface DashboardResumen {
  postitulos: number;
  cohortes: number;
  cohortesInscripcion: number;
  cohortesActivas: number;
  cohortesInactivas: number;
  cohortesFinalizadas: number;
  cohortesCanceladas: number;
  cursantesTotales: number;
  cursantesActivos: number;
  cursantesAdeudan: number;
  cursantesBaja: number;
  cursantesFinalizados: number;
  inscriptosTotales: number;
}

export interface DashboardPostituloRow {
  postituloId: number;
  nombre: string;
  codigo: string | null;
  anio: number;
  estado: DashboardCohorteEstado;
  aulas: number;
  cursantes: number;
  cursantesActivos: number;
  cursantesAdeudan: number;
  cursantesBaja: number;
  cursantesFinalizados: number;
  inscriptos: number;
}

export interface DashboardHistoricalYear {
  anio: number;
  resumen: DashboardResumen;
  porPostitulo: DashboardPostituloRow[];
}

export interface DashboardData {
  alcance: DashboardAlcance;
  porAnio: DashboardHistoricalYear[];
}

export interface DashboardDesgranamientoRow {
  postituloId: number;
  postitulo: string;
  codigo: string | null;
  anio: number;
  mes: number;
  fechaCorte: string;
  totalInicial: number;
  activos: number;
  adeuda: number;
  baja: number;
  finalizado: number;
  totalFoto: number;
  desgranamientoPct: number;
}

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export interface DashboardDesgranamientoApiResponse {
  success: boolean;
  message: string;
  data: {
    series: DashboardDesgranamientoRow[];
  };
}
