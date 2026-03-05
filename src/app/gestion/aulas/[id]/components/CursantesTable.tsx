"use client";

import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import api from "@/services/api";
import { Cursante, CursanteAula } from "@/types/cursante";

import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import PillMenu from "@/components/ui/PillMenu";
import {
  getEstadoCursanteMeta,
  getDocumentacionCursanteMeta,
} from "@/constants/pillColor";

interface Props {
  data?: CursanteAula[];
  aulaId: number;
  onDeleted?: () => void;
}

export default function CursantesTable({
  data = [],
  aulaId,
  onDeleted,
}: Props) {
  const [rows, setRows] = useState<CursanteAula[]>(data);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<CursanteAula | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 🔹 Abrir menú de opciones
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    cursante: CursanteAula
  ) => {
    setAnchorEl(event.currentTarget);
    setSelected(cursante);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // 🔹 Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/aulas/${aulaId}/cursantes/${selected.id}`);
      setRows((prev) => prev.filter((c) => c.id !== selected.id));
      setConfirmOpen(false);
      onDeleted?.();
    } catch (err) {
      console.error("Error al eliminar cursante:", err);
    }
  };

  // 🔹 Actualización local tras editar estado o documentación
  const handleLocalUpdate = (
    id: number,
    field: keyof CursanteAula,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // 🔹 Columnas de DataGrid
  const columns: GridColDef[] = [
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "dni", headerName: "DNI", width: 130 },
    { field: "email", headerName: "Email", flex: 1.2 },
    { field: "celular", headerName: "Celular", flex: 1.2 },
    {
      field: "documentacion",
      headerName: "Documentación",
      flex: 1.2,
      renderCell: (params) => {
        const opciones = ["VERIFICADA", "PENDIENTE", "NO_CORRESPONDE"].map(
          (v) => ({
            value: v,
            label: getDocumentacionCursanteMeta(v).label,
            color: getDocumentacionCursanteMeta(v).color as string,
          })
        );

        return (
          <PillMenu
            value={params.value}
            options={opciones}
            onChange={async (nuevoValor) => {
              try {
                await api.patch(
                  `/aulas/${aulaId}/cursantes/${params.row.id}/documentacion`,
                  { documentacion: nuevoValor }
                );
                handleLocalUpdate(params.row.id, "documentacion", nuevoValor);
              } catch (e) {
                console.error("Error al actualizar documentación", e);
              }
            }}
          />
        );
      },
    },
    {
      field: "estado",
      headerName: "Estado",
      flex: 1.2,
      renderCell: (params) => {
        const opciones = ["ACTIVO", "ADEUDA", "BAJA"].map((value) => {
          const meta = getEstadoCursanteMeta(value);
          return {
            value,
            label: meta.label,
            color: meta.color as string,
          };
        });

        return (
          <PillMenu
            value={params.value}
            options={opciones}
            filled
            onChange={async (nuevoValor) => {
              try {
                await api.patch(
                  `/aulas/${aulaId}/cursantes/${params.row.id}/estado`,
                  { estado: nuevoValor }
                );
                handleLocalUpdate(params.row.id, "estado", nuevoValor);
              } catch (e) {
                console.error("Error al actualizar estado", e);
              }
            }}
          />
        );
      },
    },
    {
      field: "acciones",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ width: "100%", maxHeight: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No hay cursantes registrados.
                </Typography>
              </Box>
            ),
          }}
        />
      </Box>

      {/* 🔹 Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Ver detalle" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setConfirmOpen(true);
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Eliminar" />
        </MenuItem>
      </Menu>

      {/* 🔹 Diálogo de confirmación */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar cursante"
        message="¿Seguro que querés eliminar a"
        highlightText={`${selected?.cursante?.nombre || ""} ${
          selected?.cursante?.apellido || ""
        }`}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </>
  );
}
