"use client";

import { Box, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DashboardCohorteEstado, DashboardPostituloRow } from "@/features/dashboard/model/types";

interface Props {
  items: DashboardPostituloRow[];
  showYear?: boolean;
}

const estadoMeta: Record<
  DashboardCohorteEstado,
  { label: string; color: "default" | "warning" | "success" | "info" | "error" }
> = {
  INSCRIPCION: { label: "Inscripcion", color: "warning" },
  ACTIVA: { label: "Activa", color: "success" },
  INACTIVA: { label: "Inactiva", color: "default" },
  FINALIZADA: { label: "Finalizada", color: "info" },
  CANCELADA: { label: "Cancelada", color: "error" },
};

export default function DashboardPostitulosSection({ items, showYear = false }: Props) {
  const columns: GridColDef[] = [
    {
      field: "nombre",
      headerName: "Postitulo",
      flex: 1.5,
      minWidth: 260,
      valueGetter: (_, row: DashboardPostituloRow) =>
        row.codigo ? `${row.nombre} (${row.codigo})` : row.nombre,
    },
    ...(showYear
      ? [
          {
            field: "anio",
            headerName: "Ano",
            width: 100,
            type: "number" as const,
          },
        ]
      : []),
    {
      field: "estado",
      headerName: "Estado",
      width: 140,
      renderCell: ({ value }) => {
        const meta = estadoMeta[value as DashboardCohorteEstado];
        return <Chip size="small" label={meta.label} color={meta.color} />;
      },
    },
    {
      field: "aulas",
      headerName: "Aulas",
      width: 100,
      type: "number",
    },
    {
      field: "cursantes",
      headerName: "Cursantes",
      width: 120,
      type: "number",
    },
    {
      field: "cursantesActivos",
      headerName: "Activos",
      width: 110,
      type: "number",
    },
    {
      field: "cursantesAdeudan",
      headerName: "Adeudan",
      width: 110,
      type: "number",
    },
    {
      field: "cursantesBaja",
      headerName: "Baja",
      width: 100,
      type: "number",
    },
    {
      field: "cursantesFinalizados",
      headerName: "Finalizados",
      width: 120,
      type: "number",
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: 520 }}>
      <DataGrid
        rows={items}
        columns={columns}
        getRowId={(row) => `${row.postituloId}-${row.anio}`}
        disableRowSelectionOnClick
        initialState={{
          sorting: {
            sortModel: [
              ...(showYear ? [{ field: "anio", sort: "desc" as const }] : []),
              { field: "cursantes", sort: "desc" as const },
            ],
          },
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        localeText={{
          noRowsLabel: "No hay postitulos para mostrar",
        }}
      />
    </Box>
  );
}
