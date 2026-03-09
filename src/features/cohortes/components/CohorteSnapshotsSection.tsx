"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Group, PersonRemoveAlt1, WorkspacePremium, TrendingDown } from "@mui/icons-material";
import { getCohorteSnapshots, SnapshotAulaRef, SnapshotSerieItem } from "@/features/cohortes/api";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

interface Props {
  cohorteId: number;
}

function formatMonthLabel(item: SnapshotSerieItem) {
  return new Date(item.anio, item.mes - 1, 1).toLocaleDateString("es-AR", {
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Group;
}) {
  return (
    <Card variant="hoverable" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: "#f5f7fa",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function CohorteSnapshotsSection({ cohorteId }: Props) {
  const [serie, setSerie] = useState<SnapshotSerieItem[]>([]);
  const [aulas, setAulas] = useState<SnapshotAulaRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const lineChartInstanceRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    const loadSnapshots = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextData = await getCohorteSnapshots(cohorteId);
        setSerie(nextData.serie);
        setAulas(nextData.aulas);
      } catch {
        setSerie([]);
        setAulas([]);
        setError("No se pudo cargar la serie mensual de la cohorte.");
      } finally {
        setLoading(false);
      }
    };

    void loadSnapshots();
  }, [cohorteId]);

  const puntos = useMemo(
    () =>
      serie.map((item) => ({
        label: formatMonthLabel(item),
        activos: item.activos,
        adeuda: item.adeuda,
        baja: item.baja,
        finalizado: item.finalizado,
        totalInicial: item.totalInicial,
        desgranamientoPct:
          item.totalInicial > 0 ? Number(((item.baja / item.totalInicial) * 100).toFixed(1)) : 0,
      })),
    [serie]
  );

  const ultimo = puntos[puntos.length - 1] ?? null;

  useEffect(() => {
    const canvas = barChartRef.current;
    if (!canvas || !puntos.length) return;

    barChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: puntos.map((item) => item.label),
        datasets: [
          {
            label: "Activos",
            data: puntos.map((item) => item.activos),
            backgroundColor: "#2e7d32",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Adeuda",
            data: puntos.map((item) => item.adeuda),
            backgroundColor: "#ed9d13",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Baja",
            data: puntos.map((item) => item.baja),
            backgroundColor: "#d32f2f",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Finalizado",
            data: puntos.map((item) => item.finalizado),
            backgroundColor: "#1565c0",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false,
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              precision: 0,
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
  }, [puntos]);

  useEffect(() => {
    const canvas = lineChartRef.current;
    if (!canvas || !puntos.length) return;

    lineChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: puntos.map((item) => item.label),
        datasets: [
          {
            label: "% desgranamiento",
            data: puntos.map((item) => item.desgranamientoPct),
            borderColor: "#d32f2f",
            backgroundColor: "rgba(211,47,47,0.16)",
            pointBackgroundColor: "#d32f2f",
            pointRadius: 4,
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => formatPercent(Number(context.raw)),
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
      },
    };

    lineChartInstanceRef.current = new Chart(canvas, config);

    return () => {
      lineChartInstanceRef.current?.destroy();
      lineChartInstanceRef.current = null;
    };
  }, [puntos]);

  return (
    <Stack spacing={3}>
      {loading ? (
        <Stack minHeight={200} alignItems="center" justifyContent="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography color="text.secondary">Cargando serie mensual...</Typography>
        </Stack>
      ) : null}

      {!loading && error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !error && !puntos.length ? (
        <Alert severity="info">Todavia no hay snapshots mensuales para esta cohorte.</Alert>
      ) : null}

      {!loading && !error && puntos.length ? (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard
                label="Total inicial"
                value={ultimo?.totalInicial.toLocaleString("es-AR") ?? "0"}
                icon={Group}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard
                label="Bajas acumuladas"
                value={ultimo?.baja.toLocaleString("es-AR") ?? "0"}
                icon={PersonRemoveAlt1}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard
                label="Finalizados"
                value={ultimo?.finalizado.toLocaleString("es-AR") ?? "0"}
                icon={WorkspacePremium}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard
                label="% desgranamiento final"
                value={ultimo ? formatPercent(ultimo.desgranamientoPct) : "0.0%"}
                icon={TrendingDown}
              />
            </Grid>
          </Grid>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Evolucion mensual de cursantes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Barras apiladas por mes con activos, adeuda, baja y finalizado.
                  </Typography>
                </Box>
                <Box sx={{ height: 360 }}>
                  <canvas ref={barChartRef} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Desgranamiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Porcentaje acumulado de bajas sobre el total inicial.
                  </Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <canvas ref={lineChartRef} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary">
            Aulas incluidas: {aulas.length}. {aulas.map((aula) => aula.nombre).join(" | ")}
          </Typography>
        </>
      ) : null}
    </Stack>
  );
}
