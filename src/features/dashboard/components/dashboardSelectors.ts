"use client";

import {
  DashboardData,
  DashboardHistoricalYear,
  DashboardPostituloRow,
  DashboardResumen,
} from "@/features/dashboard/model/types";
import { DashboardTabValue } from "./dashboardViewConfig";

export type DashboardHistoricalFilter = "all" | number;

export interface DashboardDerivedView {
  resumen: DashboardResumen;
  porPostitulo: DashboardPostituloRow[];
  availableYears: number[];
  selectedHistoricalYear: DashboardHistoricalFilter;
}

function createEmptyResumen(): DashboardResumen {
  return {
    postitulos: 0,
    cohortes: 0,
    cohortesInscripcion: 0,
    cohortesActivas: 0,
    cohortesInactivas: 0,
    cohortesFinalizadas: 0,
    cohortesCanceladas: 0,
    cursantesTotales: 0,
    cursantesActivos: 0,
    cursantesAdeudan: 0,
    cursantesBaja: 0,
    cursantesFinalizados: 0,
    inscriptosTotales: 0,
  };
}

function mergeResumen(items: DashboardResumen[]): DashboardResumen {
  const merged = createEmptyResumen();

  for (const item of items) {
    merged.postitulos += item.postitulos;
    merged.cohortes += item.cohortes;
    merged.cohortesInscripcion += item.cohortesInscripcion;
    merged.cohortesActivas += item.cohortesActivas;
    merged.cohortesInactivas += item.cohortesInactivas;
    merged.cohortesFinalizadas += item.cohortesFinalizadas;
    merged.cohortesCanceladas += item.cohortesCanceladas;
    merged.cursantesTotales += item.cursantesTotales;
    merged.cursantesActivos += item.cursantesActivos;
    merged.cursantesAdeudan += item.cursantesAdeudan;
    merged.cursantesBaja += item.cursantesBaja;
    merged.cursantesFinalizados += item.cursantesFinalizados;
    merged.inscriptosTotales += item.inscriptosTotales;
  }

  return merged;
}

export function deriveDashboardView(
  dashboard: DashboardData,
  activeTab: DashboardTabValue,
  selectedHistoricalYear: DashboardHistoricalFilter
): DashboardDerivedView {
  const currentYear = new Date().getFullYear();
  const availableYears = [...dashboard.porAnio].map((item) => item.anio).sort((a, b) => b - a);

  if (activeTab === "current") {
    const currentBlock = dashboard.porAnio.find((item) => item.anio === currentYear) ?? null;

    return {
      resumen: currentBlock?.resumen ?? createEmptyResumen(),
      porPostitulo: currentBlock?.porPostitulo ?? [],
      availableYears,
      selectedHistoricalYear,
    };
  }

  const yearBlock =
    selectedHistoricalYear === "all"
      ? null
      : dashboard.porAnio.find((item) => item.anio === selectedHistoricalYear) ?? null;

  const rows =
    yearBlock?.porPostitulo ??
    dashboard.porAnio.flatMap((item: DashboardHistoricalYear) => item.porPostitulo);

  return {
    resumen: yearBlock?.resumen ?? mergeResumen(dashboard.porAnio.map((item) => item.resumen)),
    porPostitulo: rows,
    availableYears,
    selectedHistoricalYear: yearBlock ? selectedHistoricalYear : "all",
  };
}

export function sortDashboardPostitulos(items: DashboardPostituloRow[]) {
  return [...items].sort((a, b) => {
    if (b.anio !== a.anio) return b.anio - a.anio;
    if (b.cursantes !== a.cursantes) return b.cursantes - a.cursantes;
    if (b.inscriptos !== a.inscriptos) return b.inscriptos - a.inscriptos;
    return a.nombre.localeCompare(b.nombre);
  });
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
