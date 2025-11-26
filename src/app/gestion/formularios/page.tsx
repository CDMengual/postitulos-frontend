"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/components/ui/BackButton";
import FormulariosCard from "./components/FormulariosCard";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Formulario } from "@/types/formulario";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Formulario[];
  meta?: { total: number };
}

export default function CohortesPage() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Formulario | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getFormularios = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/formularios");
      setFormularios(response.data.data);
    } catch (err) {
      console.error("Error getting cohortes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFormularios();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/cohortes/${selected.id}`);
      getFormularios();
    } catch (err) {
      console.error("Error deleting cohorte:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <>
      <BackButton sx={{ mb: 2 }} />
      <Box p={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Cohortes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Crear cohorte
          </Button>
        </Stack>

        <FormulariosCard data={formularios} />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminación"
          message="¿Estás seguro de que querés eliminar la cohorte"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
