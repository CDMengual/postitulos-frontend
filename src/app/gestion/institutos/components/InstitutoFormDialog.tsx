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
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface Instituto {
  id?: number;
  nombre: string;
  distritoId?: number | null;
}

interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  instituto?: Instituto | null;
}

export default function InstitutoFormDialog({
  open,
  onClose,
  onSaved,
  instituto,
}: Props) {
  const [form, setForm] = useState<Instituto>({ nombre: "", distritoId: null });
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchDistritos = async () => {
      try {
        const { data } = await api.get("/distritos"); // 🔹 endpoint que deberías tener o crear
        setDistritos(data.data);
      } catch (err) {
        console.error("Error cargando distritos:", err);
      }
    };
    fetchDistritos();
  }, [open]);

  useEffect(() => {
    if (instituto) setForm(instituto);
    else setForm({ nombre: "", distritoId: null });
  }, [instituto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (instituto?.id) {
        await api.patch(`/institutos/${instituto.id}`, form);
      } else {
        await api.post("/institutos", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error guardando instituto:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {instituto ? "Editar Instituto" : "Nuevo Instituto"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nombre del Instituto"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
          />
          <Autocomplete
            options={distritos}
            getOptionLabel={(option) =>
              `${option.nombre} — Región ${option.regionId}`
            }
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
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {instituto ? "Guardar cambios" : "Crear instituto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
