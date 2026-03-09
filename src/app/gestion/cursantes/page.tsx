"use client";

import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { appToast } from "@/shared/lib/toast";
import {
  Cursante,
  CursanteFormDialog,
  CursantesTable,
  useCursantes,
} from "@/features/cursantes";

export default function CursantesPage() {
  const { cursantes, total, page, pageSize, search, loading, setSearch, refresh, removeCursante } =
    useCursantes();
  const [selected, setSelected] = useState<Cursante | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (cursante: Cursante) => {
    setSelected(cursante);
    setOpenForm(true);
  };

  const handleDelete = (cursante: Cursante) => {
    setSelected(cursante);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await removeCursante(selected.id);
      appToast.success("Cursante eliminado correctamente");
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
      setSelected(null);
    }
  };

  const handleFormSaved = async () => {
    setOpenForm(false);
    await refresh();
  };

  return (
    <Box p={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Cursantes ({total})
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            label="Buscar cursante"
            placeholder="Nombre, apellido, email o DNI"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 320 } }}
          />

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nuevo Cursante
          </Button>
        </Stack>
      </Stack>

      <CursantesTable
        data={cursantes}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(nextPage, nextPageSize) => void refresh(nextPage, nextPageSize)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CursanteFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelected(null);
        }}
        onSaved={() => void handleFormSaved()}
        cursante={selected}
      />

      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false);
          setSelected(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminacion"
        message="Estas seguro de que queres eliminar al cursante"
        highlightText={selected ? `${selected.nombre} ${selected.apellido}` : ""}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
