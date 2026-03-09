"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CursantesTable from "./components/CursantesTable";
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import api from "@/shared/api/client";
import { Cursante } from "@/types/cursante";
import CursanteFormDialog from "./components/CursanteFormDialog";
import { appToast } from "@/shared/lib/toast";

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cursante | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const getCursantes = useCallback(async (pageParam = 1, limitParam = 10, searchParam = "") => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: pageParam,
        limit: limitParam,
      };

      if (searchParam) {
        params.search = searchParam;
      }

      const response = await api.get<ApiResponse>("/cursantes", { params });
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
  }, []);

  useEffect(() => {
    getCursantes(1, pageSize, debouncedSearch);
  }, [debouncedSearch, getCursantes, pageSize]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    getCursantes(newPage, newPageSize, debouncedSearch);
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
      await getCursantes(page, pageSize, debouncedSearch);
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
      setSelected(null);
    }
  };

  const handleFormSaved = async () => {
    setOpenForm(false);
    await getCursantes(page, pageSize, debouncedSearch);
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
