"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  EditableInstituto,
  InstitutoFormDialog,
  InstitutosTable,
  useInstitutos,
} from "@/features/institutos";
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { appToast } from "@/shared/lib/toast";

export default function InstitutosPage() {
  const [selected, setSelected] = useState<EditableInstituto | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { institutos, loading, refresh, removeInstituto, getEditableInstituto } = useInstitutos();

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = async (instituto: EditableInstituto) => {
    const editableInstituto = await getEditableInstituto(instituto);
    setSelected(editableInstituto);
    setOpenForm(true);
  };

  const handleDelete = (instituto: EditableInstituto) => {
    setSelected(instituto);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await removeInstituto(selected.id);
      appToast.success("Instituto borrado con exito");
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Institutos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo instituto
        </Button>
      </Stack>

      <InstitutosTable data={institutos} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      <InstitutoFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        instituto={selected}
        onSaved={() => {
          setOpenForm(false);
          void refresh();
        }}
      />

      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminacion"
        message="Estas seguro de que queres eliminar el instituto"
        highlightText={selected?.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
