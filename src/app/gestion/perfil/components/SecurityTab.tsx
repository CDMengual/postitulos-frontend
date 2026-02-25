"use client";

import { Box, Button, Stack, TextField } from "@mui/material";

export type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface Props {
  form: PasswordForm;
  saving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function SecurityTab({ form, saving, onChange, onSubmit }: Props) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Contraseña actual"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={onChange}
          fullWidth
          required
        />
        <TextField
          label="Nueva contraseña"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={onChange}
          helperText="Minimo 8 caracteres"
          fullWidth
          required
        />
        <TextField
          label="Confirmar nueva contraseña"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={onChange}
          fullWidth
          required
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
