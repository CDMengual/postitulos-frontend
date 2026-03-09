"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import {
  DashboardHistoricalFilter,
  DashboardSummaryCards,
  DashboardViewHeader,
  DashboardContent,
  deriveDashboardView,
  formatDateInput,
  sortDashboardPostitulos,
  DashboardTabValue,
  getSummaryMetrics,
  useDashboard,
} from "@/features/dashboard";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import { DashboardFilters } from "@/features/dashboard";
import { appToast } from "@/shared/lib/toast";

function createAllTimeFilters(): Required<DashboardFilters> {
  return {
    fechaDesde: "1900-01-01",
    fechaHasta: formatDateInput(new Date()),
  };
}

export default function GestionIndex() {
  const router = useRouter();
  const { user, loading: userLoading } = useUserContext();
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<DashboardTabValue>("current");
  const [selectedHistoricalYear, setSelectedHistoricalYear] =
    useState<DashboardHistoricalFilter>("all");
  const { dashboard, loading, error, loadDashboard } = useDashboard();

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    loadDashboard();
  }, [user, userLoading, router]);

  const currentView = useMemo(() => {
    if (!dashboard) return null;
    return deriveDashboardView(dashboard, activeTab, selectedHistoricalYear);
  }, [activeTab, dashboard, selectedHistoricalYear]);

  useEffect(() => {
    if (activeTab === "current") {
      setSelectedHistoricalYear("all");
    }
  }, [activeTab]);

  const summaryMetrics = useMemo(() => {
    if (!currentView) return [];
    return getSummaryMetrics(activeTab, currentView.resumen);
  }, [activeTab, currentView]);

  const sortedPostitulos = useMemo(() => {
    if (!currentView) return [];
    return sortDashboardPostitulos(currentView.porPostitulo);
  }, [currentView]);

  const isEmpty =
    !loading &&
    !error &&
    currentView &&
    summaryMetrics.every((metric) => metric.value === 0) &&
    currentView.porPostitulo.length === 0;

  if (userLoading || (loading && !dashboard && !error)) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center" spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Cargando dashboard...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            loadDashboard().catch(() => {
              appToast.error("No se pudo actualizar el dashboard.");
            });
          }}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Stack>

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadDashboard()}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <DashboardViewHeader
        activeTab={activeTab}
        currentYear={currentYear}
        availableYears={currentView?.availableYears ?? []}
        selectedHistoricalYear={currentView?.selectedHistoricalYear ?? "all"}
        onChangeTab={setActiveTab}
        onChangeHistoricalYear={setSelectedHistoricalYear}
      />

      {dashboard ? <DashboardSummaryCards metrics={summaryMetrics} /> : null}

      {isEmpty ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Sin datos para mostrar
            </Typography>
            <Typography color="text.secondary">
              El endpoint respondio correctamente, pero todavia no hay informacion cargada para este
              alcance.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {currentView && !isEmpty ? (
        <DashboardContent
          activeTab={activeTab}
          currentYear={currentYear}
          selectedHistoricalYear={currentView.selectedHistoricalYear}
          view={currentView}
          sortedPostitulos={sortedPostitulos}
        />
      ) : null}
    </Stack>
  );
}
