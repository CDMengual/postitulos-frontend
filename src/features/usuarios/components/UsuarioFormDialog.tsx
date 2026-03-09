"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { appToast } from "@/shared/lib/toast";
import { createUsuario, listInstitutos, updateUsuario } from "@/features/usuarios/api";
import {
  User,
  UsuarioFormData,
  UsuarioFormInstitutoOption,
} from "@/features/usuarios/model/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user?: User | null;
}

const INITIAL_FORM: UsuarioFormData = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  celular: "",
  rol: "REFERENTE",
  password: "",
  institutoId: null,
};

export default function UsuarioFormDialog({ open, onClose, onSaved, user }: Props) {
  const [form, setForm] = useState<UsuarioFormData>(INITIAL_FORM);
  const [institutos, setInstitutos] = useState<UsuarioFormInstitutoOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchInstitutos = async () => {
      try {
        const nextInstitutos = await listInstitutos();
        setInstitutos(nextInstitutos);
      } catch (err) {
        console.error("Error cargando institutos:", err);
      }
    };

    void fetchInstitutos();
  }, [open]);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        email: user.email,
        celular: user.celular ?? "",
        rol: user.rol,
        password: "",
        institutoId: user.institutoId ?? null,
      });
      return;
    }

    setForm(INITIAL_FORM);
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "institutoId") {
      setForm((prev) => ({ ...prev, institutoId: value === "" ? null : Number(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    form.nombre.trim().length > 0 &&
    form.apellido.trim().length > 0 &&
    form.dni.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.celular.trim().length > 0 &&
    form.rol.trim().length > 0 &&
    (user ? true : (form.password ?? "").trim().length > 0);

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);

      if (user) {
        await updateUsuario(user.id, form);
        appToast.success("Usuario actualizado con Ã©xito");
      } else {
        await createUsuario(form);
        appToast.success("Usuario creado con Ã©xito");
      }

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
      <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth required />
          <TextField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} fullWidth required />
          <TextField label="DNI" name="dni" value={form.dni} onChange={handleChange} fullWidth required />
          <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
          <TextField label="Celular" name="celular" value={form.celular} onChange={handleChange} fullWidth required />
          <TextField select label="Rol" name="rol" value={form.rol} onChange={handleChange} fullWidth required>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="REFERENTE">Referente</MenuItem>
          </TextField>
          <TextField select label="Instituto" name="institutoId" value={form.institutoId ?? ""} onChange={handleChange} fullWidth>
            <MenuItem value="">Sin asignar</MenuItem>
            {institutos.map((instituto) => (
              <MenuItem key={instituto.id} value={instituto.id}>
                {instituto.nombre}
              </MenuItem>
            ))}
          </TextField>
          {!user ? (
            <TextField
              label="ContraseÃ±a"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isFormValid}>
          {loading ? <CircularProgress size={16} color="inherit" /> : user ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
