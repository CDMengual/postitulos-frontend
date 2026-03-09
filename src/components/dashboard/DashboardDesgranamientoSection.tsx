"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
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
import { CoPresent, PendingActions, PersonRemoveAlt1, TrendingDown, WorkspacePremium } from "@mui/icons-material";
import { getDashboardDesgranamiento } from "@/services/dashboardService";
import { DashboardDesgranamientoRow } from "@/types/dashboard";

Chart.register(
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
  currentYear: number;
}

interface DesgranamientoPostituloOption {
  id: number;
  nombre: string;
  codigo: string | null;
}

interface DesgranamientoChartPoint {
  anio: number;
  mes: number;
  label: string;
  totalInicial: number;
  activos: number;
  adeuda: number;
  baja: number;
  finalizado: number;
  desgranamientoPct: number;
}

function formatMonthLabel(item: { anio: number; mes: number }) {
  return new Date(item.anio, item.mes - 1, 1).toLocaleDateString("es-AR", {
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function SummaryMetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CoPresent;
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

function PostituloSummaryCard({
  item,
}: {
  item: DashboardDesgranamientoRow;
}) {
  return (
    <Card variant="hoverable" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {item.postitulo}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.codigo ? `Codigo ${item.codigo}` : "Sin codigo"}
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Activos
              </Typography>
              <Typography fontWeight={600}>{item.activos.toLocaleString("es-AR")}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Adeuda
              </Typography>
              <Typography fontWeight={600}>{item.adeuda.toLocaleString("es-AR")}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Baja
              </Typography>
              <Typography fontWeight={600}>{item.baja.toLocaleString("es-AR")}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" color="text.secondary">
                Finalizado
              </Typography>
              <Typography fontWeight={600}>{item.finalizado.toLocaleString("es-AR")}</Typography>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="body2" color="text.secondary">
              % desgranamiento
            </Typography>
            <Typography fontWeight={700}>{formatPercent(item.desgranamientoPct)}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardDesgranamientoSection({ currentYear }: Props) {
  const [series, setSeries] = useState<DashboardDesgranamientoRow[]>([]);
  const [selectedAnio, setSelectedAnio] = useState<number | "">("");
  const [selectedPostituloId, setSelectedPostituloId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const rankingChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const lineChartInstanceRef = useRef<Chart<"line"> | null>(null);
  const rankingChartInstanceRef = useRef<Chart<"bar"> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardDesgranamiento();
        const safeData = Array.isArray(data) ? data : [];
        setSeries(safeData);

        const anios = [...new Set(safeData.map((item) => item.anio))].sort((a, b) => b - a);
        const defaultAnio = anios.includes(currentYear) ? currentYear : (anios[0] ?? "");
        setSelectedAnio(defaultAnio);
      } catch {
        setSeries([]);
        setError("No se pudo cargar el desgranamiento.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentYear]);

  const aniosDisponibles = useMemo(
    () => [...new Set(series.map((item) => item.anio))].sort((a, b) => b - a),
    [series]
  );

  const postitulosDisponibles = useMemo(
    () =>
      [
        ...new Map(
          series.map((item) => [
            item.postituloId,
            {
              id: item.postituloId,
              nombre: item.postitulo,
              codigo: item.codigo,
            },
          ])
        ).values(),
      ].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [series]
  );

  const filtrados = useMemo(
    () =>
      series.filter((item) => {
        const matchAnio = selectedAnio ? item.anio === selectedAnio : true;
        const matchPostitulo = selectedPostituloId ? item.postituloId === selectedPostituloId : true;
        return matchAnio && matchPostitulo;
      }),
    [selectedAnio, selectedPostituloId, series]
  );

  const resumenPorPostitulo = useMemo(
    () =>
      Object.values(
        filtrados.reduce(
          (acc, item) => {
            const current = acc[item.postituloId];
            if (!current || item.mes > current.mes) {
              acc[item.postituloId] = item;
            }
            return acc;
          },
          {} as Record<number, DashboardDesgranamientoRow>
        )
      ).sort((a, b) => a.postitulo.localeCompare(b.postitulo)),
    [filtrados]
  );

  const serieGeneral = useMemo(
    () =>
      Object.values(
        filtrados.reduce(
          (acc, item) => {
            const key = `${item.anio}-${item.mes}`;
            const current = acc[key];
            if (!current) {
              acc[key] = {
                anio: item.anio,
                mes: item.mes,
                label: formatMonthLabel(item),
                totalInicial: item.totalInicial,
                activos: item.activos,
                adeuda: item.adeuda,
                baja: item.baja,
                finalizado: item.finalizado,
                desgranamientoPct: item.totalInicial > 0 ? (item.baja / item.totalInicial) * 100 : 0,
              };
              return acc;
            }

            current.totalInicial += item.totalInicial;
            current.activos += item.activos;
            current.adeuda += item.adeuda;
            current.baja += item.baja;
            current.finalizado += item.finalizado;
            current.desgranamientoPct =
              current.totalInicial > 0 ? (current.baja / current.totalInicial) * 100 : 0;
            return acc;
          },
          {} as Record<string, DesgranamientoChartPoint>
        )
      ).sort((a, b) => a.mes - b.mes),
    [filtrados]
  );

  const seriePostitulo = useMemo(
    () =>
      filtrados
        .filter((item) => (selectedPostituloId ? item.postituloId === selectedPostituloId : true))
        .sort((a, b) => a.mes - b.mes)
        .map((item) => ({
          ...item,
          label: formatMonthLabel(item),
        })),
    [filtrados, selectedPostituloId]
  );

  const rankingPostitulos = useMemo(
    () =>
      resumenPorPostitulo
        .map((item) => ({
          label: item.codigo ? `${item.postitulo} (${item.codigo})` : item.postitulo,
          desgranamientoPct: item.desgranamientoPct,
          baja: item.baja,
        }))
        .sort((a, b) => b.desgranamientoPct - a.desgranamientoPct),
    [resumenPorPostitulo]
  );

  const chartSeries = selectedPostituloId ? seriePostitulo : serieGeneral;
  const ultimo = chartSeries[chartSeries.length - 1] ?? null;

  useEffect(() => {
    const canvas = barChartRef.current;
    if (!canvas || !chartSeries.length) return;

    barChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: chartSeries.map((item) => item.label),
        datasets: [
          {
            label: "Activos",
            data: chartSeries.map((item) => item.activos),
            backgroundColor: "#2e7d32",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Adeuda",
            data: chartSeries.map((item) => item.adeuda),
            backgroundColor: "#ed9d13",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Baja",
            data: chartSeries.map((item) => item.baja),
            backgroundColor: "#d32f2f",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Finalizado",
            data: chartSeries.map((item) => item.finalizado),
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
  }, [chartSeries]);

  useEffect(() => {
    const canvas = lineChartRef.current;
    if (!canvas || !chartSeries.length) return;

    lineChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels: chartSeries.map((item) => item.label),
        datasets: [
          {
            label: "% desgranamiento",
            data: chartSeries.map((item) => item.desgranamientoPct),
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
  }, [chartSeries]);

  useEffect(() => {
    const canvas = rankingChartRef.current;
    if (!canvas || selectedPostituloId || !rankingPostitulos.length) return;

    rankingChartInstanceRef.current?.destroy();

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: rankingPostitulos.map((item) => item.label),
        datasets: [
          {
            label: "% desgranamiento",
            data: rankingPostitulos.map((item) => item.desgranamientoPct),
            backgroundColor: "rgba(211,47,47,0.72)",
            borderColor: "#d32f2f",
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = rankingPostitulos[context.dataIndex];
                return `${formatPercent(Number(context.raw))} · ${point.baja.toLocaleString("es-AR")} bajas`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    rankingChartInstanceRef.current = new Chart(canvas, config);

    return () => {
      rankingChartInstanceRef.current?.destroy();
      rankingChartInstanceRef.current = null;
    };
  }, [rankingPostitulos, selectedPostituloId]);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", lg: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 180 } }}>
          <InputLabel id="dashboard-desgranamiento-anio-label">Ano</InputLabel>
          <Select
            labelId="dashboard-desgranamiento-anio-label"
            value={String(selectedAnio)}
            label="Ano"
            onChange={(event) => setSelectedAnio(Number(event.target.value))}
          >
            {aniosDisponibles.map((anio) => (
              <MenuItem key={anio} value={String(anio)}>
                {anio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 280 } }}>
          <InputLabel id="dashboard-desgranamiento-postitulo-label">Postitulo</InputLabel>
          <Select
            labelId="dashboard-desgranamiento-postitulo-label"
            value={String(selectedPostituloId)}
            label="Postitulo"
            onChange={(event) =>
              setSelectedPostituloId(event.target.value ? Number(event.target.value) : "")
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {postitulosDisponibles.map((item: DesgranamientoPostituloOption) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.codigo ? `${item.nombre} (${item.codigo})` : item.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Stack minHeight={220} alignItems="center" justifyContent="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography color="text.secondary">Cargando desgranamiento...</Typography>
        </Stack>
      ) : null}

      {!loading && error ? <Alert severity="error">{error}</Alert> : null}

      {!loading && !error && !filtrados.length ? (
        <Alert severity="info">No hay datos de desgranamiento para el filtro seleccionado.</Alert>
      ) : null}

      {!loading && !error && filtrados.length ? (
        <>
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="Total inicial"
                  value={ultimo?.totalInicial.toLocaleString("es-AR") ?? "0"}
                  icon={CoPresent}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="Activos"
                  value={ultimo?.activos.toLocaleString("es-AR") ?? "0"}
                  icon={CoPresent}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="Adeuda"
                  value={ultimo?.adeuda.toLocaleString("es-AR") ?? "0"}
                  icon={PendingActions}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="Baja"
                  value={ultimo?.baja.toLocaleString("es-AR") ?? "0"}
                  icon={PersonRemoveAlt1}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="Finalizado"
                  value={ultimo?.finalizado.toLocaleString("es-AR") ?? "0"}
                  icon={WorkspacePremium}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <SummaryMetricCard
                  label="% desgranamiento"
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
                      Evolucion mensual
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPostituloId
                        ? "Barras apiladas por mes para el postitulo seleccionado."
                        : "Barras apiladas por mes agregadas para todos los postitulos del ano seleccionado."}
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
                      {selectedPostituloId
                        ? "Porcentaje mensual de desgranamiento del postitulo seleccionado."
                        : "Porcentaje mensual de desgranamiento agregado para todos los postitulos del ano seleccionado."}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 280 }}>
                    <canvas ref={lineChartRef} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {!selectedPostituloId ? (
              <Stack spacing={2}>
                <Card>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Ranking de desgranamiento
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Comparacion por postitulo usando el ultimo mes disponible del ano seleccionado.
                        </Typography>
                      </Box>
                      <Box sx={{ height: Math.max(260, rankingPostitulos.length * 56) }}>
                        <canvas ref={rankingChartRef} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Resumen por postitulo usando el ultimo mes disponible del ano seleccionado.
                  </Typography>
                  <Grid container spacing={2}>
                    {resumenPorPostitulo.map((item) => (
                      <Grid key={item.postituloId} size={{ xs: 12, md: 6, xl: 4 }}>
                        <PostituloSummaryCard item={item} />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Stack>
            ) : null}
          </>
        </>
      ) : null}
    </Stack>
  );
}
