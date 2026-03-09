"use client";

import DashboardCharts from "./DashboardCharts";
import DashboardDesgranamientoSection from "./DashboardDesgranamientoSection";
import DashboardPostitulosSection from "./DashboardPostitulosSection";
import DashboardSectionCard from "./DashboardSectionCard";
import { DashboardPostituloRow, DashboardResumen } from "@/types/dashboard";
import { DashboardHistoricalFilter } from "./dashboardSelectors";
import { DashboardTabValue } from "./dashboardViewConfig";

interface Props {
  activeTab: DashboardTabValue;
  currentYear: number;
  selectedHistoricalYear: DashboardHistoricalFilter;
  view: {
    resumen: DashboardResumen;
    porPostitulo: DashboardPostituloRow[];
  };
  sortedPostitulos: DashboardPostituloRow[];
}

export default function DashboardContent({
  activeTab,
  currentYear,
  selectedHistoricalYear,
  view,
  sortedPostitulos,
}: Props) {
  const showYearColumn = activeTab === "historical" && selectedHistoricalYear === "all";

  return (
    <>
      <DashboardSectionCard title="Visualizaciones">
        <DashboardCharts postitulos={sortedPostitulos} resumen={view.resumen} />
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Desgranamiento por postitulo"
        subtitle="Selecciona un ano y, si quieres, un postitulo para ver su evolucion mensual."
      >
        <DashboardDesgranamientoSection currentYear={currentYear} />
      </DashboardSectionCard>

      <DashboardSectionCard title="Detalle por postitulo">
        <DashboardPostitulosSection items={sortedPostitulos} showYear={showYearColumn} />
      </DashboardSectionCard>
    </>
  );
}
