"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import { saveCursante } from "@/features/cursantes/api";
import { Cursante, CursanteFormData } from "@/features/cursantes/model/types";
import { appToast } from "@/shared/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  cursante?: Cursante | null;
}

const INITIAL_FORM: CursanteFormData = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  celular: "",
  titulo: "",
};

export default function CursanteFormDialog({ open, onClose, onSaved, cursante }: Props) {
  const [form, setForm] = useState<CursanteFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (cursante) {
      setForm({
        nombre: cursante.nombre ?? "",
        apellido: cursante.apellido ?? "",
        dni: cursante.dni ?? "",
        email: cursante.email ?? "",
        celular: cursante.celular ?? "",
        titulo: cursante.titulo ?? "",
      });
      return;
    }

    setForm(INITIAL_FORM);
  }, [open, cursante]);

  const isFormValid =
    form.nombre.trim().length > 0 &&
    form.apellido.trim().length > 0 &&
    form.dni.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.celular.trim().length > 0;

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      await saveCursante(form, cursante);
      appToast.success(cursante?.id ? "Cursante actualizado con exito" : "Cursante creado con exito");
      onSaved();
      handleClose();
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{cursante ? "Editar cursante" : "Nuevo cursante"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField required fullWidth label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
          <TextField required fullWidth label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
          <TextField required fullWidth label="DNI" name="dni" value={form.dni} onChange={handleChange} />
          <TextField required fullWidth label="Email" name="email" value={form.email} onChange={handleChange} />
          <TextField required fullWidth label="Celular" name="celular" value={form.celular} onChange={handleChange} />
          <TextField fullWidth label="Titulo" name="titulo" value={form.titulo} onChange={handleChange} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isFormValid}>
          {loading ? <CircularProgress size={16} color="inherit" /> : cursante ? "Guardar cambios" : "Crear cursante"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
