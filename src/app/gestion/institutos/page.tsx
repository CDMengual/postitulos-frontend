"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InstitutosTable from "./components/InstitutosTable";
import InstitutoFormDialog from "./components/InstitutoFormDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Instituto } from "@/types/instituto";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Instituto[];
  meta: { total: number };
}

export default function InstitutosPage() {
  const [institutos, setInstitutos] = useState<Instituto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Instituto | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getInstitutos = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/institutos");
      setInstitutos(response.data.data);
    } catch (err) {
      console.error("Error al obtener institutos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInstitutos();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (instituto: Instituto) => {
    setSelected(instituto);
    setOpenForm(true);
  };

  const handleDelete = (instituto: Instituto) => {
    setSelected(instituto);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/institutos/${selected.id}`);
      getInstitutos();
    } catch (err) {
      console.error("Error eliminando instituto:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getInstitutos();
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
          Institutos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Instituto
        </Button>
      </Stack>

      <InstitutosTable
        data={institutos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InstitutoFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        instituto={selected}
        onSaved={handleFormSuccess}
      />

      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar el instituto"
        highlightText={selected?.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
