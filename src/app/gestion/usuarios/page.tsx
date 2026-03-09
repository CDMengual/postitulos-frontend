"use client";

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import { appToast } from "@/shared/lib/toast";
import UsuarioFormDialog from "@/features/usuarios/components/UsuarioFormDialog";
import UsuariosTable from "@/features/usuarios/components/UsuariosTable";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { User } from "@/features/usuarios/model/types";

export default function UsuariosPage() {
  const { usuarios, loading, refresh, removeUsuario } = useUsuarios();
  const [selected, setSelected] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleCreate = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (usuario: User) => {
    setSelected(usuario);
    setOpenForm(true);
  };

  const handleDelete = (usuario: User) => {
    setSelected(usuario);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await removeUsuario(selected.id);
      appToast.success("Usuario eliminado con Ã©xito");
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
          Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </Stack>

      <UsuariosTable
        data={usuarios}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <UsuarioFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        user={selected}
        onSaved={refresh}
      />
      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminaciÃ³n"
        message="Â¿EstÃ¡s seguro de que querÃ©s eliminar al usuario"
        highlightText={`${selected?.nombre ?? ""} ${selected?.apellido ?? ""}`}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
