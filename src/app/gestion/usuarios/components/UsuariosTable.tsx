"use client";

import { useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Stack,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User } from "@/types/user";

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

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 120 },
    { field: "apellido", headerName: "Apellido", flex: 1, minWidth: 120 },
    { field: "dni", headerName: "DNI", flex: 0.8, minWidth: 100 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "celular", headerName: "Celular", flex: 1, minWidth: 120 },
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
      field: "region",
      headerName: "Región",
      flex: 0.5,
      minWidth: 50,
      valueGetter: (value, row) => row.instituto?.distrito?.region?.id || "-",
    },
    {
      field: "rol",
      headerName: "Rol",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Chip
          label={params.row.rol}
          color={params.row.rol === "ADMIN" ? "primary" : "default"}
          size="small"
        />
      ),
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
        getRowId={(row) => row.id}
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
