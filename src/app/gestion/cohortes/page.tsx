"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/components/ui/BackButton";
import CohortesTable from "./components/CohortesTable";
import CohorteFormDialog from "./components/CohorteFormDialog";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Cohorte } from "@/types/cohorte";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Cohorte[];
  meta?: { total: number };
}

export default function CohortesPage() {
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cohorte | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getCohortes = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/cohortes");
      setCohortes(response.data.data);
    } catch (err) {
      console.error("Error getting cohortes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCohortes();
  }, []);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (cohorte: Cohorte) => {
    setSelected(cohorte);
    setOpenForm(true);
  };

  const handleDelete = (cohorte: Cohorte) => {
    setSelected(cohorte);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/cohortes/${selected.id}`);
      getCohortes();
    } catch (err) {
      console.error("Error deleting cohorte:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getCohortes();
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

        <CohortesTable
          data={cohortes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <CohorteFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSaved={handleFormSuccess}
          cohorte={selected}
        />

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
