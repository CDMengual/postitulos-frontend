"use client";

import { useMemo, useState } from "react";
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
import BackButton from "@/shared/components/ui/BackButton";
import ConfirmDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import { appToast } from "@/shared/lib/toast";
import { Aula, AulaFormDialog, AulasTable, useAulas } from "@/features/aulas";

const ESTADO_COHORTE_FILTER_OPTIONS = [
  "INSCRIPCION",
  "ACTIVA",
  "FINALIZADA",
  "INACTIVA",
  "CANCELADA",
] as const;

export default function AulasPage() {
  const { user } = useUserContext();
  const [selected, setSelected] = useState<Aula | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState("ALL");
  const [postituloFilter, setPostituloFilter] = useState("");
  const { aulas, postitulos, loading, refresh, removeAula } = useAulas({
    estado: estadoFilter,
    postituloId: postituloFilter,
  });

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleDelete = (aula: Aula) => {
    setSelected(aula);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await removeAula(selected.id);
      appToast.success("Aula eliminada");
    } catch {
      appToast.error();
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

  const postituloOptions = useMemo(
    () =>
      [...postitulos].sort((a, b) =>
        `${a.nombre} ${a.codigo ?? ""}`.localeCompare(`${b.nombre} ${b.codigo ?? ""}`)
      ),
    [postitulos]
  );

  return (
    <>
      <BackButton sx={{ mb: 2 }} />
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Aulas
          </Typography>
          {user?.rol === "ADMIN" && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Crear aula
            </Button>
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          mb={3}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
            <InputLabel id="aulas-estado-filter-label">Estado</InputLabel>
            <Select
              labelId="aulas-estado-filter-label"
              label="Estado"
              value={estadoFilter}
              onChange={(event) => setEstadoFilter(event.target.value)}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              {estadoOptions.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {getEstadoCohorteMeta(estado).label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 280 } }}>
            <InputLabel id="aulas-postitulo-filter-label">Postitulo</InputLabel>
            <Select
              labelId="aulas-postitulo-filter-label"
              label="Postitulo"
              value={postituloFilter}
              onChange={(event) => setPostituloFilter(event.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {postituloOptions.map((postitulo) => (
                <MenuItem key={postitulo.id} value={String(postitulo.id)}>
                  {postitulo.nombre} ({postitulo.codigo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {aulas.length} aula{aulas.length === 1 ? "" : "s"}
          </Typography>
        </Stack>

        <AulasTable data={aulas} onDelete={handleDelete} />

        <AulaFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSaved={() => {
            setOpenForm(false);
            void refresh();
          }}
        />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminacion"
          message="Estas seguro de que queres eliminar el aula"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
