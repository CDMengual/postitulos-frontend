"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { DashboardPostituloRow, DashboardResumen } from "@/features/dashboard/model/types";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip
);

interface Props {
  postitulos: DashboardPostituloRow[];
  resumen: DashboardResumen;
}

type CursanteMetricKey =
  | "cursantesActivos"
  | "cursantes"
  | "cursantesBaja"
  | "cursantesFinalizados"
  | "cursantesAdeudan";

const estadoPalette = [
  {
    key: "cohortesInscripcion",
    label: "Inscripcion",
    valueKey: "cohortesInscripcion",
    color: "#ed9d13",
  },
  { key: "cohortesActivas", label: "Activas", valueKey: "cohortesActivas", color: "#2e7d32" },
  { key: "cohortesInactivas", label: "Inactivas", valueKey: "cohortesInactivas", color: "#78909c" },
  {
    key: "cohortesFinalizadas",
    label: "Finalizadas",
    valueKey: "cohortesFinalizadas",
    color: "#1565c0",
  },
  {
    key: "cohortesCanceladas",
    label: "Canceladas",
    valueKey: "cohortesCanceladas",
    color: "#d32f2f",
  },
] as const;

const estadoTooltipLabelMap = {
  INSCRIPCION: "Inscripcion",
  ACTIVA: "Activas",
  INACTIVA: "Inactivas",
  FINALIZADA: "Finalizadas",
  CANCELADA: "Canceladas",
} as const;

const chartMetricOptions: Array<{
  value: CursanteMetricKey;
  label: string;
  color: string;
}> = [
  { value: "cursantesActivos", label: "Activos", color: "#2e7d32" },
  { value: "cursantes", label: "Totales", color: "#007c8c" },
  { value: "cursantesBaja", label: "Baja", color: "#d32f2f" },
  { value: "cursantesFinalizados", label: "Finalizados", color: "#1565c0" },
  { value: "cursantesAdeudan", label: "Adeudan", color: "#ed9d13" },
];

function formatPostituloLabel(item: DashboardPostituloRow, includeYear: boolean) {
  const baseLabel = item.codigo ? `${item.nombre} (${item.codigo})` : item.nombre;
  return includeYear ? `${baseLabel} - ${item.anio}` : baseLabel;
}

function formatEstadoDetailLabel(item: DashboardPostituloRow) {
  const baseLabel = item.codigo ? `${item.nombre} (${item.codigo})` : item.nombre;
  return `${baseLabel} - ${item.anio}`;
}

export default function DashboardCharts({ postitulos, resumen }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<CursanteMetricKey>("cursantesActivos");
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const donutChartInstanceRef = useRef<Chart<"doughnut"> | null>(null);

  const selectedMetricOption =
    chartMetricOptions.find((item) => item.value === selectedMetric) ?? chartMetricOptions[0];

  const chartRows = useMemo(() => {
    return Array.from(
      postitulos.reduce<
        Map<
          number,
          {
            id: number;
            label: string;
            value: number;
            cursantes: number;
          }
        >
      >((acc, item) => {
        const current = acc.get(item.postituloId);
        if (current) {
          current.value += item[selectedMetric];
          current.cursantes += item.cursantes;
          return acc;
        }

        acc.set(item.postituloId, {
          id: item.postituloId,
          label: formatPostituloLabel(item, false),
          value: item[selectedMetric],
          cursantes: item.cursantes,
        });
        return acc;
      }, new Map())
    )
      .map(([, item]) => item)
      .sort((a, b) => {
        const diff = b.value - a.value;
        if (diff !== 0) return diff;
        if (b.cursantes !== a.cursantes) return b.cursantes - a.cursantes;
        return a.label.localeCompare(b.label);
      })
      .slice(0, 8)
      .map((item) => ({
        id: String(item.id),
        label: item.label,
        value: item.value,
      }));
  }, [postitulos, selectedMetric]);

  useEffect(() => {
    const canvas = barChartRef.current;
    if (!canvas) return;

    barChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: chartRows.map((item) => item.label),
        datasets: [
          {
            label: selectedMetricOption.label,
            data: chartRows.map((item) => item.value),
            backgroundColor: selectedMetricOption.color,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 28,
          },
        ],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 250,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${selectedMetricOption.label}: ${Number(context.raw).toLocaleString("es-AR")}`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            grid: {
              color: "#e5ebef",
            },
            border: {
              display: false,
            },
          },
          y: {
            ticks: {
              color: "#455a64",
              font: {
                size: 12,
              },
            },
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
        },
      },
    };

    barChartInstanceRef.current = new Chart(canvas, config);

    return () => {
      barChartInstanceRef.current?.destroy();
      barChartInstanceRef.current = null;
    };
  }, [chartRows, selectedMetric, selectedMetricOption]);

  const estadoData = estadoPalette.map((item) => ({
    label: item.label,
    color: item.color,
    value: resumen[item.valueKey],
  }));
  const totalEstados = estadoData.reduce((acc, item) => acc + item.value, 0);
  const nonZeroEstadoData = estadoData.filter((item) => item.value > 0);
  const cohortesPorEstado = useMemo(
    () =>
      postitulos.reduce<Record<string, string[]>>((acc, item) => {
        const estado = estadoTooltipLabelMap[item.estado];
        const currentItems = acc[estado] ?? [];
        currentItems.push(formatEstadoDetailLabel(item));
        acc[estado] = currentItems.sort((a, b) => a.localeCompare(b));
        return acc;
      }, {}),
    [postitulos]
  );

  useEffect(() => {
    const canvas = donutChartRef.current;
    if (!canvas) return;

    donutChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: nonZeroEstadoData.map((item) => item.label),
        datasets: [
          {
            data: nonZeroEstadoData.map((item) => item.value),
            backgroundColor: nonZeroEstadoData.map((item) => item.color),
            borderWidth: 0,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              boxWidth: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => [
                `${context.label}: ${Number(context.raw).toLocaleString("es-AR")}`,
                ...(cohortesPorEstado[context.label] ?? []).map((item) => `- ${item}`),
              ],
            },
          },
        },
      },
    };

    donutChartInstanceRef.current = new Chart(canvas, config);

    return () => {
      donutChartInstanceRef.current?.destroy();
      donutChartInstanceRef.current = null;
    };
  }, [cohortesPorEstado, nonZeroEstadoData]);

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Card sx={{ flex: 1, minWidth: 0 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cursantes por postitulo
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={selectedMetric}
                  onChange={(event) => setSelectedMetric(event.target.value as CursanteMetricKey)}
                >
                  {chartMetricOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {chartRows.length ? (
              <Box sx={{ height: Math.max(280, chartRows.length * 54) }}>
                <canvas ref={barChartRef} />
              </Box>
            ) : (
              <Typography color="text.secondary">
                No hay datos suficientes para el grafico.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, minWidth: 0 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2} alignItems="center">
            <Box sx={{ alignSelf: "stretch" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Estados de cohortes
              </Typography>
            </Box>

            {nonZeroEstadoData.length ? (
              <Box sx={{ position: "relative", width: "100%", maxWidth: 360, height: 360 }}>
                <canvas ref={donutChartRef} />
                <Stack
                  spacing={0}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalEstados.toLocaleString("es-AR")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    cohortes
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No hay datos suficientes para el grafico.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
