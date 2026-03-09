"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/components/ui/BackButton";
import CohortesTable from "./components/CohortesTable";
import CohorteFormDialog from "./components/CohorteFormDialog";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Cohorte } from "@/types/cohorte";
import { getEstadoCohorteMeta } from "@/constants/pillColor";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Cohorte[];
  meta?: { total: number };
}

const ESTADO_COHORTE_FILTER_OPTIONS = [
  "INSCRIPCION",
  "ACTIVA",
  "INACTIVA",
  "FINALIZADA",
  "CANCELADA",
] as const;

export default function CohortesPage() {
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cohorte | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState("DEFAULT");

  const getCohortes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (estadoFilter !== "DEFAULT") {
        params.estado = estadoFilter;
      }

      const response = await api.get<ApiResponse>("/cohortes", { params });
      setCohortes(response.data.data);
    } catch (err) {
      console.error("Error getting cohortes:", err);
    } finally {
      setLoading(false);
    }
  }, [estadoFilter]);

  useEffect(() => {
    getCohortes();
  }, [getCohortes]);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (cohorte: Cohorte) => {
    setSelected(cohorte);
    setOpenForm(true);
  };

  const handleDelete = (cohorte: Cohorte) => {
    setSelected(cohorte);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/cohortes/${selected.id}`);
      getCohortes();
    } catch (err) {
      console.error("Error deleting cohorte:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getCohortes();
  };

  const estadoOptions = useMemo(
    () =>
      [...ESTADO_COHORTE_FILTER_OPTIONS].sort((a, b) =>
        getEstadoCohorteMeta(a).label.localeCompare(getEstadoCohorteMeta(b).label)
      ),
    []
  );

  return (
    <>
      <BackButton sx={{ mb: 2 }} />
      <Box p={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Cohortes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Crear cohorte
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          mb={3}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 240 } }}>
            <InputLabel id="cohortes-estado-filter-label">Estado</InputLabel>
            <Select
              labelId="cohortes-estado-filter-label"
              label="Estado"
              value={estadoFilter}
              onChange={(event) => setEstadoFilter(event.target.value)}
            >
              <MenuItem value="DEFAULT">En inscripcion y activas</MenuItem>
              <MenuItem value="ALL">Todos</MenuItem>
              {estadoOptions.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {getEstadoCohorteMeta(estado).label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {cohortes.length} cohorte{cohortes.length === 1 ? "" : "s"}
          </Typography>
        </Stack>

        <CohortesTable
          data={cohortes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CohorteFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSaved={handleFormSuccess}
          cohorte={selected}
        />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminación"
          message="¿Estás seguro de que querés eliminar la cohorte"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
