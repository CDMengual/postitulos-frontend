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
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useLoading } from "@/components/providers/LoadingProvider";
import { Aula } from "@/types/aula";
import { useUserContext } from "@/components/providers/UserProvider";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import Pill from "@/components/ui/Pill";

interface Props {
  data: Aula[];
  loading: boolean;
  onDelete: (aula: Aula) => void;
}

export default function AulasTable({ data, loading, onDelete }: Props) {
  const { user } = useUserContext();
  const { setLoading } = useLoading();
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
    setLoading(true);
    if (selectedRow) router.push(`/gestion/aulas/${selectedRow.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) onDelete(selectedRow);
    handleMenuClose();
  };

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: "codigo",
        headerName: "Código",
        flex: 0.8,
      },
      {
        field: "postitulo",
        headerName: "Postítulo",
        flex: 2,
        valueGetter: (_value, row) =>
          row.cohorte?.postitulo
            ? `${row.cohorte.postitulo.nombre} (${row.cohorte.postitulo.codigo})`
            : "-",
      },
      {
        field: "estado",
        headerName: "Estado",
        width: 150,
        renderCell: ({ row }) => {
          const meta = getEstadoCohorteMeta(row.cohorte?.estado);
          return (
            <Pill variant="filled" label={meta.label} color={meta.color} />
          );
        },
      },
    ];

    // 👤 Solo los ADMIN ven la columna "Referente"
    if (user?.rol === "ADMIN") {
      baseColumns.push({
        field: "referentes",
        headerName: "Referente",
        flex: 1,
        valueGetter: (_value, row: Aula) =>
          row.referentes?.length
            ? row.referentes.map((r) => `${r.nombre} ${r.apellido}`).join(", ")
            : "-",
      });
    }

    // ⚙️ Acciones
    baseColumns.push({
      field: "acciones",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Aula>) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(e, params.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    });

    return baseColumns;
  }, [user]);

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
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
