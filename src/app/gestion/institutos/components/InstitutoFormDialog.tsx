"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/shared/api/client";
import { Instituto } from "@/types/instituto";
import { appToast } from "@/shared/lib/toast";
import { withCache } from "@/shared/lib/cache";

interface InstitutoFormValues {
  nombre: string;
  distritoId: number | null;
}

type EditableInstituto = Instituto & { distritoId?: number | null };

interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}

const DISTRITOS_CACHE_KEY = "distritos:list";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  instituto?: EditableInstituto | null;
}

export default function InstitutoFormDialog({ open, onClose, onSaved, instituto }: Props) {
  const [form, setForm] = useState<InstitutoFormValues>({
    nombre: "",
    distritoId: null,
  });
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loading, setLoading] = useState(false);
  const isFormValid = form.nombre.trim().length > 0 && form.distritoId !== null;

  useEffect(() => {
    if (!open) return;
    const fetchDistritos = async () => {
      try {
        const data = await withCache<Distrito[]>(
          DISTRITOS_CACHE_KEY,
          async () => {
            const response = await api.get<{ data: Distrito[] }>("/distritos");
            return response.data.data ?? [];
          },
          { ttl: ONE_WEEK_MS }
        );
        setDistritos(data);
      } catch (err) {
        console.error("Error cargando distritos:", err);
      }
    };
    fetchDistritos();
  }, [open]);

  useEffect(() => {
    if (!open || !instituto) {
      setForm({ nombre: "", distritoId: null });
      return;
    }

    const rawDistritoId =
      instituto.distritoId ??
      (instituto as unknown as { distrito?: { id?: number | null } }).distrito?.id ??
      null;
    const distritoId =
      rawDistritoId === null || rawDistritoId === undefined ? null : Number(rawDistritoId);

    setForm({
      nombre: instituto.nombre ?? "",
      distritoId: Number.isNaN(distritoId) ? null : distritoId,
    });
  }, [instituto, open]);

  useEffect(() => {
    if (!instituto || form.distritoId !== null || distritos.length === 0) return;
    if (!instituto.distritoNombre) return;

    const normalizedDistritoNombre = normalizeText(instituto.distritoNombre);
    const institutoRegionId =
      instituto.regionId === null || instituto.regionId === undefined
        ? null
        : Number(instituto.regionId);

    const matchedDistrito = distritos.find((d) => {
      const sameName = normalizeText(d.nombre) === normalizedDistritoNombre;
      if (!sameName) return false;
      if (institutoRegionId === null || Number.isNaN(institutoRegionId)) return true;
      return Number(d.regionId) === institutoRegionId;
    });

    if (!matchedDistrito) return;

    setForm((prev) => ({ ...prev, distritoId: matchedDistrito.id }));
  }, [instituto, distritos, form.distritoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        distritoId: form.distritoId,
      };

      if (instituto?.id) {
        await api.patch(`/institutos/${instituto.id}`, payload);
      } else {
        await api.post("/institutos", payload);
      }

      if (instituto?.id) {
        appToast.success("Instituto actualizado con éxito");
      } else {
        appToast.success("Instituto creado con éxito");
      }
      onSaved();
      onClose();
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{instituto ? "Editar Instituto" : "Nuevo Instituto"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre del Instituto"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
          <Autocomplete
            options={distritos}
            getOptionLabel={(option) => `${option.nombre} — Región ${option.regionId}`}
            value={distritos.find((d) => d.id === form.distritoId) || null}
            onChange={(_, newValue) =>
              setForm((prev) => ({
                ...prev,
                distritoId: newValue ? newValue.id : null,
              }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Distrito"
                placeholder="Seleccionar distrito"
                fullWidth
                required
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isFormValid}>
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : instituto ? (
            "Guardar cambios"
          ) : (
            "Crear instituto"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
