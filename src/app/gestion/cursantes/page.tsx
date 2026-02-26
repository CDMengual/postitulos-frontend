"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CursantesTable from "./components/CursantesTable";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Cursante } from "@/types/cursante";
import CursanteFormDialog from "./components/CursanteFormDialog";
import { appToast } from "@/utils/toast";

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    cursantes: Cursante[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CursantesPage() {
  const [cursantes, setCursantes] = useState<Cursante[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cursante | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const getCursantes = async (pageParam = 1, limitParam = 10) => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>(
        `/cursantes?page=${pageParam}&limit=${limitParam}`
      );
      const { cursantes, total } = response.data.data;
      setCursantes(cursantes);
      setTotal(total);
      setPage(pageParam);
      setPageSize(limitParam);
    } catch (err) {
      console.error("Error getting cursantes:", err);
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCursantes();
  }, []);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    getCursantes(newPage, newPageSize);
  };

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
      await api.delete(`/cursantes/${selected.id}`);
      appToast.success("Cursante eliminado correctamente");
      await getCursantes(page, pageSize);
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
      setSelected(null);
    }
  };

  const handleFormSaved = async () => {
    setOpenForm(false);
    await getCursantes(page, pageSize);
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
          Cursantes ({total})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nuevo Cursante
        </Button>
      </Stack>

      <CursantesTable
        data={cursantes}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CursanteFormDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelected(null);
        }}
        onSaved={handleFormSaved}
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
