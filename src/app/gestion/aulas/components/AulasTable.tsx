"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Aula } from "@/types/aula";
import { useUserContext } from "@/components/providers/UserProvider";
import { getPostituloTypeMeta } from "@/constants/postituloTypes";
import Pill from "@/components/ui/Pill";

interface Props {
  data: Aula[];
  loading: boolean;
  onDelete: (aula: Aula) => void;
}

export default function AulasTable({ data, loading, onDelete }: Props) {
  const { user } = useUserContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Aula | null>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: Aula) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleView = () => {
    if (selectedRow) router.push(`/gestion/aulas/${selectedRow.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) onDelete(selectedRow);
    handleMenuClose();
  };

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      { field: "codigo", headerName: "Aula", flex: 0.8 },

      {
        field: "postitulo",
        headerName: "Postítulo",
        flex: 1.5,
        valueGetter: (_value, row) =>
          row.postitulo
            ? `${row.postitulo.nombre} – ${row.postitulo.codigo ?? ""}`
            : "-",
      },
      { field: "cohorte", headerName: "Cohorte", width: 100 },
    ];

    // 👇 Solo los ADMIN ven la columna "Referente"
    if (user?.rol === "ADMIN") {
      baseColumns.push({
        field: "referentes",
        headerName: "Referente",
        flex: 1,
        valueGetter: (_value, row: Aula) =>
          row.referentes && row.referentes.length > 0
            ? row.referentes.map((r) => `${r.nombre} ${r.apellido}`).join(", ")
            : "-",
      });
    }

    // Se agrega pill y acciones
    baseColumns.push({
      field: "tipo",
      headerName: "Tipo",
      flex: 0.7,
      renderCell: ({ row }) => {
        const { label, color } = getPostituloTypeMeta(row.postitulo.tipo);
        return (
          <Pill
            label={label}
            color={color}
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
        );
      },
    });
    baseColumns.push({
      field: "acciones",
      headerName: "",
      width: 50,
      renderCell: (params: GridRenderCellParams<Aula>) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    });

    return baseColumns;
  }, [user]);

  return (
    <Box sx={{ height: "auto", width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 25]}
      />

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
