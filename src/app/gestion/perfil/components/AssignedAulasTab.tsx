"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Aula } from "@/types/aula";
import Pill from "@/components/ui/Pill";
import { getEstadoCohorteMeta } from "@/constants/pillColor";

interface Props {
  loading: boolean;
  aulas: Aula[];
}

export default function AssignedAulasTab({ loading, aulas }: Props) {
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "codigo",
        headerName: "Codigo",
        flex: 0.8,
        minWidth: 120,
      },
      {
        field: "postitulo",
        headerName: "Postitulo",
        flex: 2,
        minWidth: 220,
        valueGetter: (_value, row: Aula) =>
          row.cohorte?.postitulo
            ? `${row.cohorte.postitulo.nombre} (${row.cohorte.postitulo.codigo})`
            : "-",
      },

      {
        field: "estado",
        headerName: "Estado",
        width: 150,
        sortable: false,
        renderCell: ({ row }) => {
          const meta = getEstadoCohorteMeta(row.cohorte?.estado);
          return <Pill variant="filled" label={meta.label} color={meta.color} />;
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%", minHeight: 420 }}>
      <DataGrid
        rows={aulas}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
        pageSizeOptions={[5, 10, 25]}
        localeText={{ noRowsLabel: "No tenes aulas asignadas." }}
      />
    </Box>
  );
}
