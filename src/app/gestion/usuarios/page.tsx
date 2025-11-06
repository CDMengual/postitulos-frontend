"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UsuariosTable from "./components/UsuariosTable";
import UsuariosFormDialog from "./components/UsuarioFormDialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { User } from "@/types/user";

interface ApiResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    total: number;
  };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/users");
      const users = response.data.data;
      setUsuarios(users);
    } catch (err) {
      console.error("Error getting users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

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
      await api.delete(`/users/${selected.id}`);
      getUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setOpenConfirm(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    getUsers();
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
          Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Usuario
        </Button>
      </Stack>

      <UsuariosTable
        data={usuarios}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <UsuariosFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        user={selected}
        onSaved={getUsers}
      />
      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar al usuario"
        highlightText={`${selected?.nombre ?? ""} ${selected?.apellido ?? ""}`}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
