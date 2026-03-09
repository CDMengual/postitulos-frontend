"use client";

import { useParams } from "next/navigation";
import { Box, Container, Stack, Typography } from "@mui/material";
import FormularioPreview from "@/features/formularios/components/gestion/FormularioPreview";
import FormularioInfoCard from "@/features/formularios/components/gestion/FormularioInfoCard";
import { useFormularioDetail } from "@/features/formularios/hooks/useFormularioDetail";

export default function FormularioDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const { formulario } = useFormularioDetail(id);

  if (!formulario) return null;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack alignItems="center" spacing={2} mb={4}>
        <Box component="img" src="/assets/logos/banner_pba.svg" alt="Logo" sx={{ height: 100 }} />
        <Typography variant="h4" fontWeight={600}>
          {formulario.nombre}
        </Typography>
      </Stack>
      <FormularioInfoCard formulario={formulario} />
      <FormularioPreview formulario={formulario} />
    </Container>
  );
}
