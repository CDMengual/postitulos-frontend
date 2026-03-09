"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import PillMenu from "@/shared/components/ui/PillMenu";
import {
  getDocumentacionCursanteMeta,
  getEstadoCursanteMeta,
} from "@/constants/pillColor";
import {
  deleteAulaCursante,
  updateAulaCursanteDocumentacion,
  updateAulaCursanteEstado,
} from "@/features/aulas/api";
import {
  AulaCursanteRow,
  DocumentacionCursante,
  EstadoCursante,
} from "@/features/cursantes/model/types";

interface Props {
  data?: AulaCursanteRow[];
  aulaId: number;
  aulaNombre?: string;
  onDeleted?: () => void;
}

export default function AulaCursantesTable({ data = [], aulaId, aulaNombre, onDeleted }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<AulaCursanteRow[]>(data);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<AulaCursanteRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cursante: AulaCursanteRow) => {
    setAnchorEl(event.currentTarget);
    setSelected(cursante);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      await deleteAulaCursante(aulaId, selected.id);
      setRows((prev) => prev.filter((item) => item.id !== selected.id));
      setConfirmOpen(false);
      onDeleted?.();
    } catch (error) {
      console.error("Error al eliminar cursante:", error);
    }
  };

  const handleLocalUpdate = (id: number, field: keyof AulaCursanteRow, value: string) => {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const columns: GridColDef[] = [
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "dni", headerName: "DNI", width: 130 },
    { field: "email", headerName: "Email", flex: 1.2 },
    { field: "celular", headerName: "Celular", flex: 1.2 },
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
                await updateAulaCursanteEstado(aulaId, params.row.id, nuevoValor as EstadoCursante);
                handleLocalUpdate(params.row.id, "estado", nuevoValor as EstadoCursante);
              } catch (error) {
                console.error("Error al actualizar estado", error);
              }
            }}
          />
        );
      },
    },
    {
      field: "documentacion",
      headerName: "Documentacion",
      flex: 1.2,
      renderCell: (params) => {
        const opciones = ["VERIFICADA", "PENDIENTE", "NO_CORRESPONDE"].map((value) => {
          const meta = getDocumentacionCursanteMeta(value);
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
            onChange={async (nuevoValor) => {
              try {
                await updateAulaCursanteDocumentacion(
                  aulaId,
                  params.row.id,
                  nuevoValor as DocumentacionCursante
                );
                handleLocalUpdate(
                  params.row.id,
                  "documentacion",
                  nuevoValor as DocumentacionCursante
                );
              } catch (error) {
                console.error("Error al actualizar documentacion", error);
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
        <IconButton size="small" onClick={(event) => handleMenuOpen(event, params.row)}>
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
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (!selected) return;
            const query = aulaNombre ? `?aulaNombre=${encodeURIComponent(aulaNombre)}` : "";
            router.push(`/gestion/aulas/${aulaId}/cursantes/${selected.id}${query}`);
            handleMenuClose();
          }}
        >
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

      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar cursante"
        message="Seguro que queres eliminar a"
        highlightText={`${selected?.nombre || ""} ${selected?.apellido || ""}`}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </>
  );
}
