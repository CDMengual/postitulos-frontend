"use client";

import { useRouter } from "next/navigation";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PillMenu from "@/shared/components/ui/PillMenu";
import {
  getDocumentacionCursanteMeta,
  getEstadoInscripcionPrivadaMeta,
} from "@/constants/pillColor";
import { formatDate } from "@/shared/lib/date";
import {
  DocumentacionInscripcion,
  EstadoInscripcionPrivada,
  INSCRIPCION_DOCUMENTACIONES,
  INSCRIPCION_ESTADOS,
  InscripcionListadoItem,
} from "@/features/inscripciones/model/types";

interface Props {
  rows: InscripcionListadoItem[];
  allowedInstitutosByCohorte: Record<number, { id: number; nombre: string }[]>;
  isAdmin: boolean;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  savingRowIds: number[];
  onPageChange: (page: number, pageSize: number) => void;
  onEstadoChange: (id: number, estado: EstadoInscripcionPrivada) => Promise<void>;
  onDocumentacionChange: (id: number, documentacion: DocumentacionInscripcion) => Promise<void>;
  onInstitutoChange: (id: number, institutoId: number | null) => Promise<void>;
}

export default function InscripcionesTable({
  rows,
  allowedInstitutosByCohorte,
  isAdmin,
  total,
  page,
  pageSize,
  loading,
  savingRowIds,
  onPageChange,
  onEstadoChange,
  onDocumentacionChange,
  onInstitutoChange,
}: Props) {
  const router = useRouter();

  const isRowSaving = (id: number) => savingRowIds.includes(id);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange(model.page + 1, model.pageSize);
  };

  const columns: GridColDef<InscripcionListadoItem>[] = [
    {
      field: "apellidoNombre",
      headerName: "Apellido y nombre",
      minWidth: 220,
      flex: 1.3,
      sortable: false,
      valueGetter: (_, row) => `${row.apellido}, ${row.nombre}`,
    },
    { field: "dni", headerName: "DNI", minWidth: 120, flex: 0.6 },
    { field: "email", headerName: "Email", minWidth: 210, flex: 1.2 },
    {
      field: "instituto",
      headerName: "Instituto",
      minWidth: 220,
      flex: 1.2,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<InscripcionListadoItem>) => {
        if (!isAdmin) {
          return <Typography variant="body2">{row.instituto?.nombre || "-"}</Typography>;
        }

        const disabled = isRowSaving(row.id);
        const allowedInstitutos = allowedInstitutosByCohorte[row.cohorteId] ?? [];
        const currentInstituto =
          row.institutoId && row.instituto
            ? [{ id: row.institutoId, nombre: row.instituto.nombre }]
            : [];
        const options = [...currentInstituto, ...allowedInstitutos].filter(
          (instituto, index, list) =>
            list.findIndex((item) => item.id === instituto.id) === index
        );
        const value = row.institutoId ? String(row.institutoId) : "";

        return (
          <Select
            size="small"
            value={value}
            disabled={disabled || options.length === 0}
            displayEmpty
            onChange={(event: SelectChangeEvent<string>) => {
              const raw = event.target.value;
              void onInstitutoChange(row.id, raw === "" ? null : Number(raw));
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Sin instituto</MenuItem>
            {options.map((instituto) => (
              <MenuItem key={instituto.id} value={String(instituto.id)}>
                {instituto.nombre}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "prioridad",
      headerName: "Prioridad",
      minWidth: 110,
      width: 110,
      valueFormatter: (value: number | null | undefined) =>
        value === null || value === undefined ? "-" : String(value),
    },
    {
      field: "cohorte",
      headerName: "Cohorte",
      minWidth: 240,
      flex: 1.4,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<InscripcionListadoItem>) => (
        <Stack>
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.cohorte.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.cohorte.postitulo.nombre} ({row.cohorte.postitulo.codigo})
          </Typography>
        </Stack>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      minWidth: 170,
      flex: 0.9,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<InscripcionListadoItem>) => {
        const options = INSCRIPCION_ESTADOS.map((estado) => {
          const meta = getEstadoInscripcionPrivadaMeta(estado);
          return {
            value: estado,
            label: meta.label,
            color: meta.color as string,
          };
        });

        return (
          <PillMenu
            value={row.estado}
            options={options}
            filled
            disabled={isRowSaving(row.id)}
            onChange={(value) => void onEstadoChange(row.id, value as EstadoInscripcionPrivada)}
          />
        );
      },
    },
    {
      field: "documentacion",
      headerName: "Documentacion",
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<InscripcionListadoItem>) => {
        const options = INSCRIPCION_DOCUMENTACIONES.map((documentacion) => {
          const meta = getDocumentacionCursanteMeta(documentacion);
          return {
            value: documentacion,
            label: meta.label,
            color: meta.color as string,
          };
        });

        return (
          <PillMenu
            value={row.documentacion}
            options={options}
            disabled={isRowSaving(row.id)}
            onChange={(value) =>
              void onDocumentacionChange(row.id, value as DocumentacionInscripcion)
            }
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha alta",
      minWidth: 130,
      flex: 0.7,
      valueFormatter: (value?: string) => (value ? formatDate(value, "short") : "-"),
    },
    {
      field: "acciones",
      headerName: "",
      sortable: false,
      width: 68,
      renderCell: ({ row }: GridRenderCellParams<InscripcionListadoItem>) => (
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => router.push(`/gestion/inscripciones/${row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={total}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
      />
    </Box>
  );
}
