"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Cohorte } from "@/types/cohorte";
import PillMenu from "@/components/ui/PillMenu";
import api from "@/services/api";

interface Props {
  data: Cohorte[];
  loading?: boolean;
  onEdit: (cohorte: Cohorte) => void;
  onDelete: (cohorte: Cohorte) => void;
}

export default function CohortesTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const [rows, setRows] = useState<Cohorte[]>(data || []);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Cohorte | null>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, row: Cohorte) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleView = () => {
    if (selectedRow) router.push(`/gestion/cohortes/${selectedRow.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRow) onEdit(selectedRow);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) onDelete(selectedRow);
    handleMenuClose();
  };

  // 🔹 Actualiza estado local y API
  const handleEstadoChange = async (id: number, newEstado: string) => {
    // ✅ Actualización optimista en UI
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: newEstado } : r))
    );

    try {
      await api.patch(`/cohortes/${id}/estado`, { estado: newEstado });
    } catch (err) {
      console.error("Error cambiando estado:", err);
      // 🔙 Rollback si falla
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                estado: data.find((d) => d.id === id)?.estado || r.estado,
              }
            : r
        )
      );
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "anio", headerName: "Año", width: 100 },
      { field: "nombre", headerName: "Nombre", flex: 1 },
      {
        field: "postitulo",
        headerName: "Postítulo",
        flex: 1.2,
        valueGetter: (_, row) => row.postitulo?.nombre || "-",
      },
      { field: "cupos", headerName: "Cupos", width: 100 },
      {
        field: "fechaInicio",
        headerName: "Inicio",
        flex: 1,
        valueGetter: (_, row) =>
          row.fechaInicio ? row.fechaInicio.slice(0, 10) : "-",
      },
      {
        field: "estado",
        headerName: "Estado",
        width: 180,
        renderCell: ({ row }) => {
          const options = [
            { label: "Inactiva", value: "INACTIVA", color: "default" },
            { label: "En inscripción", value: "INSCRIPCION", color: "warning" },
            { label: "Activa", value: "ACTIVA", color: "success" },
            { label: "Finalizada", value: "FINALIZADA", color: "info" },
          ];
          return (
            <PillMenu
              value={row.estado}
              options={options}
              onChange={(val) => handleEstadoChange(row.id, val)}
              filled
            />
          );
        },
      },
      {
        field: "acciones",
        headerName: "",
        width: 50,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Cohorte>) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%", minHeight: 600 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        localeText={{
          noRowsLabel: "No hay cohortes registradas",
        }}
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ver detalle" />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Editar" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Eliminar" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
