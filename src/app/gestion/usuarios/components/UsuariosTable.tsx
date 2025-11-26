"use client";

import { useState } from "react";
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

import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { User } from "@/types/user";
import Pill from "@/components/ui/Pill";
import { getRolMeta } from "@/constants/pillColor";

interface Props {
  data: User[];
  loading: boolean;
  onEdit: (ref: User) => void;
  onDelete: (ref: User) => void;
}

export default function UsuarioTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    if (selectedRow) onEdit(selectedRow);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) onDelete(selectedRow);
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedRow) router.push(`/gestion/usuarios/${selectedRow.id}`);
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 120 },
    { field: "apellido", headerName: "Apellido", flex: 1, minWidth: 120 },
    { field: "dni", headerName: "DNI", flex: 0.8, minWidth: 100 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    {
      field: "instituto",
      headerName: "Instituto",
      flex: 0.8,
      minWidth: 100,
      valueGetter: (value, row) => row.instituto?.nombre || "-",
    },
    {
      field: "distrito",
      headerName: "Distrito",
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => row.instituto?.distrito?.nombre || "-",
    },

    {
      field: "rol",
      headerName: "Rol",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<User>) => {
        const meta = getRolMeta(params.row.rol);
        return <Pill label={meta.label} color={meta.color} />;
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      sortable: false,
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: "auto", width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={data}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
      />

      {/* Menú contextual */}
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
