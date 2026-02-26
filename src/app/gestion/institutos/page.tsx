"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InstitutosTable from "./components/InstitutosTable";
import InstitutoFormDialog from "./components/InstitutoFormDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Instituto } from "@/types/instituto";
import { withCache } from "@/utils/cache";
import { appToast } from "@/utils/toast";

interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}

type EditableInstituto = Instituto & { distritoId?: number | null };

const DISTRITOS_CACHE_KEY = "distritos:list";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

interface ApiResponse {
  success: boolean;
  message: string;
  data: EditableInstituto[];
  meta: { total: number };
}

export default function InstitutosPage() {
  const [institutos, setInstitutos] = useState<EditableInstituto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EditableInstituto | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getCachedDistritos = async () =>
    withCache<Distrito[]>(
      DISTRITOS_CACHE_KEY,
      async () => {
        const response = await api.get<{ data: Distrito[] }>("/distritos");
        return response.data.data ?? [];
      },
      { ttl: ONE_WEEK_MS }
    );

  const findDistritoId = (instituto: Partial<EditableInstituto>, distritos: Distrito[]) => {
    const nombre = instituto.distritoNombre;
    if (!nombre) return null;

    const normalizedName = normalizeText(nombre);
    const regionId =
      instituto.regionId === null || instituto.regionId === undefined
        ? null
        : Number(instituto.regionId);

    const matched = distritos.find((d) => {
      const sameName = normalizeText(d.nombre) === normalizedName;
      if (!sameName) return false;
      if (regionId === null || Number.isNaN(regionId)) return true;
      return Number(d.regionId) === regionId;
    });

    return matched?.id ?? null;
  };

  const getInstitutos = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/institutos");
      setInstitutos(response.data.data);
    } catch (err) {
      console.error("Error al obtener institutos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInstitutos();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = async (instituto: Instituto) => {
    const current = instituto as EditableInstituto;
    const directDistritoId = typeof current.distritoId === "number" ? current.distritoId : null;

    if (directDistritoId !== null) {
      setSelected({ ...current, distritoId: directDistritoId });
      setOpenForm(true);
      return;
    }

    try {
      const detailResponse = await api.get<{ data: Partial<EditableInstituto> }>(
        `/institutos/${instituto.id}`
      );
      const detail = detailResponse.data?.data ?? {};
      const detailDistritoId = typeof detail.distritoId === "number" ? detail.distritoId : null;

      if (detailDistritoId !== null) {
        setSelected({ ...current, ...detail, distritoId: detailDistritoId });
        setOpenForm(true);
        return;
      }
    } catch {
      // Si no hay endpoint de detalle, seguimos con fallback por nombre+región.
    }

    try {
      const distritos = await getCachedDistritos();
      const inferredDistritoId = findDistritoId(current, distritos);
      setSelected({ ...current, distritoId: inferredDistritoId });
    } catch {
      setSelected(current);
    }

    setOpenForm(true);
  };

  const handleDelete = (instituto: Instituto) => {
    setSelected(instituto);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/institutos/${selected.id}`);

      appToast.success("Instituto borrado con éxito");
      getInstitutos();
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getInstitutos();
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Institutos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Instituto
        </Button>
      </Stack>

      <InstitutosTable
        data={institutos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InstitutoFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        instituto={selected}
        onSaved={handleFormSuccess}
      />

      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar el instituto"
        highlightText={selected?.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
