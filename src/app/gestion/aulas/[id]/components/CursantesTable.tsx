"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface Cursante {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  celular?: number;
  region?: number;
  distrito?: string;
  titulo?: string;
}

interface Props {
  data: Cursante[];
}

export default function CursantesTable({ data }: Props) {
  const columns: GridColDef[] = [
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "dni", headerName: "DNI", width: 130 },
    { field: "email", headerName: "Email", flex: 1.2 },
    { field: "celular", headerName: "Celular", flex: 1.2 },
    { field: "region", headerName: "Region", flex: 1.2 },
    { field: "distrito", headerName: "Distrito", flex: 1.2 },
    { field: "titulo", headerName: "Titulo", flex: 1.2 },
  ];

  return (
    <Box sx={{ width: "100%", height: 600 }}>
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(r) => r.dni}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Box>
  );
}
