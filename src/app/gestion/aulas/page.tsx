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
import BackButton from "@/shared/components/ui/BackButton";
import AulasTable from "./components/AulasTable";
import AulaFormDialog from "./components/AulaFormDialog";
import ConfirmDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import api from "@/shared/api/client";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import { Aula } from "@/types/aula";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import { Postitulo } from "@/types/postitulo";

interface PostitulosResponse {
  success: boolean;
  message: string;
  data: Postitulo[];
  meta?: { total?: number };
}

const ESTADO_COHORTE_FILTER_OPTIONS = [
  "INSCRIPCION",
  "ACTIVA",
  "FINALIZADA",
  "INACTIVA",
  "CANCELADA",
] as const;

export default function AulasPage() {
  const { user } = useUserContext();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Aula | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState("ALL");
  const [postituloFilter, setPostituloFilter] = useState("");

  const getAulas = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (estadoFilter) {
        params.estado = estadoFilter;
      }

      if (postituloFilter) {
        params.postituloId = postituloFilter;
      }

      const response = await api.get("/aulas", { params });
      setAulas(response.data.data);
    } catch (err) {
      console.error("Error getting aulas:", err);
    } finally {
      setLoading(false);
    }
  }, [estadoFilter, postituloFilter]);

  const getPostitulos = async () => {
    try {
      const response = await api.get<PostitulosResponse>("/postitulos");
      setPostitulos(response.data.data);
    } catch (err) {
      console.error("Error getting postitulos:", err);
    }
  };

  useEffect(() => {
    getPostitulos();
  }, []);

  useEffect(() => {
    getAulas();
  }, [getAulas]);

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
      await api.delete(`/aulas/${selected.id}`);
      getAulas();
    } catch (err) {
      console.error("Error deleting aula:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getAulas();
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Aulas
          </Typography>
          {user?.rol === "ADMIN" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
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

        <AulasTable data={aulas} loading={loading} onDelete={handleDelete} />
        <AulaFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSaved={handleFormSuccess}
        />
        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminación"
          message="¿Estás seguro de que querés eliminar el aula"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
