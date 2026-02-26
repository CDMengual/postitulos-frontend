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
import api from "@/services/api";
import { User } from "@/types/user";
import { appToast } from "@/utils/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  user?: User | null;
}

interface UserFormData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  rol: "ADMIN" | "REFERENTE";
  password?: string;
  institutoId?: number | null;
}

const INITIAL_FORM: UserFormData = {
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
  const [form, setForm] = useState<UserFormData>(INITIAL_FORM);

  const [institutos, setInstitutos] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // cargar institutos disponibles
  useEffect(() => {
    if (!open) return;
    const fetchInstitutos = async () => {
      try {
        const { data } = await api.get("/institutos");
        const list = data.data;
        setInstitutos(list);
      } catch (err) {
        console.error("Error cargando institutos:", err);
      }
    };
    fetchInstitutos();
  }, [open]);

  // si se edita, llenar formulario
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
    } else {
      setForm(INITIAL_FORM);
    }
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
      const payload = { ...form };
      if (user) {
        delete payload.password;
        await api.patch(`/users/${user.id}`, payload);
      } else {
        await api.post("/users", { ...form });
      }

      if (user) {
        appToast.success("Usuario actualizado con éxito");
      } else {
        appToast.success("Usuario creado con éxito");
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
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="DNI"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Celular"
            name="celular"
            value={form.celular}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            select
            label="Rol"
            name="rol"
            value={form.rol}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="REFERENTE">Referente</MenuItem>
          </TextField>

          <TextField
            select
            label="Instituto"
            name="institutoId"
            value={form.institutoId ?? ""}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {institutos.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.nombre}
              </MenuItem>
            ))}
          </TextField>

          {!user && (
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !isFormValid}>
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : user ? (
            "Guardar cambios"
          ) : (
            "Crear usuario"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
