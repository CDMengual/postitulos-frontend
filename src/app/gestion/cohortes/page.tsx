"use client";

import { useMemo, useState } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/shared/components/ui/BackButton";
import ConfirmDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { appToast } from "@/shared/lib/toast";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import CohortesTable from "@/features/cohortes/components/CohortesTable";
import CohorteFormDialog from "@/features/cohortes/components/CohorteFormDialog";
import { useCohortes } from "@/features/cohortes/hooks/useCohortes";
import { Cohorte } from "@/features/cohortes/model/types";

const ESTADO_COHORTE_FILTER_OPTIONS = [
  "INSCRIPCION",
  "ACTIVA",
  "INACTIVA",
  "FINALIZADA",
  "CANCELADA",
] as const;

export default function CohortesPage() {
  const [selected, setSelected] = useState<Cohorte | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState("DEFAULT");
  const { cohortes, loading, refresh, removeCohorte } = useCohortes({ estado: estadoFilter });

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
      await removeCohorte(selected.id);
      appToast.success("Cohorte eliminada con exito");
      setSelected(null);
    } catch {
      appToast.error("No se pudo eliminar la cohorte");
    } finally {
      setOpenConfirm(false);
    }
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Cohortes
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Crear cohorte
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3} alignItems={{ xs: "stretch", md: "center" }}>
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

        <CohortesTable data={cohortes} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

        <CohorteFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSaved={() => {
            setOpenForm(false);
            void refresh();
          }}
          cohorte={selected}
        />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminacion"
          message="Estas seguro de que queres eliminar la cohorte"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
