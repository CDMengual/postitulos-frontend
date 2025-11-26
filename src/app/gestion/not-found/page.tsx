"use client";

import { Stack, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Stack
      minHeight="80vh"
      alignItems="center"
      justifyContent="center"
      spacing={2}
    >
      <SearchOffIcon color="disabled" sx={{ fontSize: 64 }} />
      <Typography variant="h5" fontWeight={600}>
        Página no encontrada
      </Typography>
      <Typography color="text.secondary" textAlign="center" maxWidth={400}>
        El recurso que intentás acceder no existe o fue eliminado.
      </Typography>
      <Button variant="contained" onClick={() => router.push("/gestion/aulas")}>
        Volver
      </Button>
    </Stack>
  );
}
