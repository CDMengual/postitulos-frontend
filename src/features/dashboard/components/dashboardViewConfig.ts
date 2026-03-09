"use client";

import {
  CoPresent,
  PendingActions,
  People,
  PersonRemoveAlt1,
  School,
  WorkspacePremium,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import { DashboardResumen } from "@/features/dashboard/model/types";

export type DashboardTabValue = "current" | "historical";

export interface SummaryMetric {
  label: string;
  value: number;
  icon: SvgIconComponent;
}

export function getSummaryMetrics(
  _activeTab: DashboardTabValue,
  resumen: DashboardResumen
): SummaryMetric[] {
  return [
    { label: "Cohortes", value: resumen.cohortes, icon: School },
    { label: "Cursantes totales", value: resumen.cursantesTotales, icon: People },
    { label: "Cursantes activos", value: resumen.cursantesActivos, icon: CoPresent },
    { label: "Cursantes adeudan", value: resumen.cursantesAdeudan, icon: PendingActions },
    { label: "Cursantes baja", value: resumen.cursantesBaja, icon: PersonRemoveAlt1 },
    {
      label: "Cursantes finalizados",
      value: resumen.cursantesFinalizados,
      icon: WorkspacePremium,
    },
  ];
}
