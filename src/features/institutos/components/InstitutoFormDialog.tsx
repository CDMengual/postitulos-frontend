"use client";

import { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { listDistritos, saveInstituto, type InstitutoFormData } from "@/features/institutos/api";
import { Distrito, EditableInstituto } from "@/features/institutos/model/types";
import { appToast } from "@/shared/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  instituto?: EditableInstituto | null;
}

const initialFormState: InstitutoFormData = {
  nombre: "",
  distritoId: null,
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export default function InstitutoFormDialog({ open, onClose, onSaved, instituto }: Props) {
  const [form, setForm] = useState<InstitutoFormData>(initialFormState);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loading, setLoading] = useState(false);
  const isFormValid = form.nombre.trim().length > 0 && form.distritoId !== null;

  useEffect(() => {
    if (!open) return;

    const fetchDistritos = async () => {
      try {
        const nextDistritos = await listDistritos();
        setDistritos(nextDistritos);
      } catch (err) {
        console.error("Error cargando distritos:", err);
      }
    };

    void fetchDistritos();
  }, [open]);

  useEffect(() => {
    if (!open || !instituto) {
      setForm(initialFormState);
      return;
    }

    const rawDistritoId =
      instituto.distritoId ?? (instituto as unknown as { distrito?: { id?: number | null } }).distrito?.id ?? null;
    const distritoId = rawDistritoId === null || rawDistritoId === undefined ? null : Number(rawDistritoId);

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
      instituto.regionId === null || instituto.regionId === undefined ? null : Number(instituto.regionId);

    const matchedDistrito = distritos.find((distrito) => {
      const sameName = normalizeText(distrito.nombre) === normalizedDistritoNombre;
      if (!sameName) return false;
      if (institutoRegionId === null || Number.isNaN(institutoRegionId)) return true;
      return Number(distrito.regionId) === institutoRegionId;
    });

    if (!matchedDistrito) return;

    setForm((prev) => ({ ...prev, distritoId: matchedDistrito.id }));
  }, [instituto, distritos, form.distritoId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      await saveInstituto(form, instituto?.id);
      appToast.success(instituto?.id ? "Instituto actualizado con exito" : "Instituto creado con exito");
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
      <DialogTitle>{instituto ? "Editar instituto" : "Nuevo instituto"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre del instituto"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
          <Autocomplete
            options={distritos}
            getOptionLabel={(option) => `${option.nombre} - Region ${option.regionId}`}
            value={distritos.find((distrito) => distrito.id === form.distritoId) || null}
            onChange={(_, newValue) =>
              setForm((prev) => ({
                ...prev,
                distritoId: newValue ? newValue.id : null,
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Distrito" placeholder="Seleccionar distrito" fullWidth required />
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
