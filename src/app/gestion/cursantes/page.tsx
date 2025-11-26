"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CursantesTable from "./components/CursantesTable";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import api from "@/services/api";
import { Cursante } from "@/types/cursante";

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
        <Button variant="contained" startIcon={<AddIcon />}>
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
        onEdit={() => {}}
        onDelete={() => {}}
      />

      <ConfirmDeleteDialog
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirmar eliminación"
        message="¿Estás seguro de que querés eliminar al cursante?"
        highlightText=""
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
