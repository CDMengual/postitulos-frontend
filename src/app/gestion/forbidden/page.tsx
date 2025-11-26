"use client";

import { Stack, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import LockIcon from "@mui/icons-material/Lock";

export default function NoAutorizadoPage() {
  const router = useRouter();

  return (
    <Stack
      minHeight="80vh"
      alignItems="center"
      justifyContent="center"
      spacing={2}
    >
      <LockIcon color="error" sx={{ fontSize: 64 }} />
      <Typography variant="h5" fontWeight={600}>
        Acceso no permitido
      </Typography>
      <Typography color="text.secondary" textAlign="center" maxWidth={400}>
        No tenés permisos para acceder a este recurso o sección.
      </Typography>
      <Button variant="contained" onClick={() => router.back()}>
        Volver
      </Button>
    </Stack>
  );
}
