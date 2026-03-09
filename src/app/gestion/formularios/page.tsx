"use client";

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/shared/components/ui/BackButton";
import ConfirmDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { Formulario, FormulariosCard, useFormularios } from "@/features/formularios";
import { appToast } from "@/shared/lib/toast";

export default function FormulariosPage() {
  const { formularios, removeFormulario } = useFormularios();
  const [selected, setSelected] = useState<Formulario | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCreate = () => {
    setSelected(null);
  };

  const handleDelete = (formulario: Formulario) => {
    setSelected(formulario);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await removeFormulario(selected.id);
      appToast.success("Formulario eliminado con exito");
      setSelected(null);
    } catch {
      appToast.error("No se pudo eliminar el formulario");
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <>
      <BackButton sx={{ mb: 2 }} />
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Formularios
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Crear formulario
          </Button>
        </Stack>

        <FormulariosCard data={formularios} onDelete={handleDelete} />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar eliminacion"
          message="Estas seguro de que queres eliminar el formulario"
          highlightText={selected?.nombre}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
