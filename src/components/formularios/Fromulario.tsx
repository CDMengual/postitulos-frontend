"use client";

import { Stack, Box, Typography, Alert } from "@mui/material";
import { CohortePublica } from "@/types/cohorte";
import FormularioInfo from "./FromularioInfo";
import FormularioForm from "./FormularioForm";

interface Props {
  cohorte: CohortePublica;
}

export default function Formulario({ cohorte }: Props) {
  if (!cohorte.formulario) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2, p: 2 }}>
        No hay formulario configurado para esta cohorte.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack alignItems="center" spacing={2} mb={4}>
        <Typography variant="h4" fontWeight={600}>
          {cohorte.postitulo.nombre}
        </Typography>
      </Stack>

      <FormularioInfo formulario={cohorte.formulario} cohorte={cohorte} />
      <FormularioForm formulario={cohorte.formulario} cohorte={cohorte} />
    </Box>
  );
}
