"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

export type ProfileForm = {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
};

interface Props {
  open: boolean;
  form: ProfileForm;
  saving: boolean;
  disableSubmit: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ProfileEditDialog({
  open,
  form,
  saving,
  disableSubmit,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar perfil</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Apellido"
                name="apellido"
                value={form.apellido}
                onChange={onChange}
                fullWidth
                required
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="DNI"
                name="dni"
                value={form.dni}
                onChange={onChange}
                fullWidth
                required
              />
              <TextField
                label="Celular"
                name="celular"
                value={form.celular}
                onChange={onChange}
                fullWidth
              />
            </Stack>
            <TextField
              label="Correo electronico"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || disableSubmit}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
