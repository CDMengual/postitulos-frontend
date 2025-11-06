"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AulasTable from "./components/AulasTable";
import AulaFormDialog from "./components/AulaFormDialog";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Aula } from "@/types/aula";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Aula[];
  meta?: { total: number };
}

export default function AulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Aula | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getAulas = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/aulas");
      setAulas(response.data.data);
    } catch (err) {
      console.error("Error getting aulas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAulas();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleDelete = (aula: Aula) => {
    setSelected(aula);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/aulas/${selected.id}`);
      getAulas();
    } catch (err) {
      console.error("Error deleting aula:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getAulas();
  };

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Aulas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Aula
        </Button>
      </Stack>

      <AulasTable data={aulas} loading={loading} onDelete={handleDelete} />
      <AulaFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={handleFormSuccess}
      />
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar el aula"
        highlightText={selected?.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
