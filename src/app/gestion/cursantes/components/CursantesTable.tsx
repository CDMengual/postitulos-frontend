"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
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
import { Cursante } from "@/types/cursante";

interface Props {
  data: Cursante[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (ref: Cursante) => void;
  onDelete: (ref: Cursante) => void;
}

export default function CursantesTable({
  data,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onEdit,
  onDelete,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<Cursante | null>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: Cursante
  ) => {
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
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "dni", headerName: "DNI", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "acciones",
      headerName: "Acciones",
      sortable: false,
      width: 100,
      renderCell: (params: GridRenderCellParams<Cursante>) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange(model.page + 1, model.pageSize);
  };

  const handleView = () => {
    if (selectedRow) router.push(`/gestion/cursantes/${selectedRow.id}`);
    handleMenuClose();
  };

  return (
    <Box sx={{ width: "100%", maxHeight: 600 }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={total}
        pageSizeOptions={[5, 10, 25]}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
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
