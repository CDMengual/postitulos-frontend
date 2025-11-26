"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import api from "@/services/api";
import { Formulario } from "@/types/formulario";
import FormularioPreview from "./components/FormularioPreview";
import FormularioInfo from "./components/FromularioInfo";

export default function FormularioDetailPage() {
  const { id } = useParams();
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/formularios/${id}`);
        setFormulario(res.data.data);
      } catch (error) {
        console.error("Error cargando formulario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (!formulario) return;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* 🏛️ Encabezado institucional */}
      <Stack alignItems="center" spacing={2} mb={4}>
        <Box
          component="img"
          src="/assets/logos/banner_pba.svg"
          alt="Logo"
          sx={{ height: 100 }}
        />
        <Typography variant="h4" fontWeight={600}>
          {formulario.nombre}
        </Typography>
      </Stack>
      <FormularioInfo formulario={formulario} />
      {/* 📋 Formulario */}
      <FormularioPreview formulario={formulario} />
    </Container>
  );
}
