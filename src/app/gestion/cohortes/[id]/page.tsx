"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BackButton from "@/shared/components/ui/BackButton";
import Pill from "@/shared/components/ui/Pill";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import { CohorteSnapshotsSection, useCohorteDetail } from "@/features/cohortes";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR").format(date);
};

export default function CohorteDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const router = useRouter();
  const { cohorte, institutosMeta, loading } = useCohorteDetail(id);

  const institutosRows = useMemo(
    () =>
      [...(cohorte?.institutos ?? [])]
        .map((instituto) => {
          const meta = institutosMeta[instituto.id];

          return {
            id: instituto.id,
            region:
              meta?.regionId !== null && meta?.regionId !== undefined ? String(meta.regionId) : "-",
            regionOrden: meta?.regionId ?? Number.MAX_SAFE_INTEGER,
            distrito: meta?.distritoNombre || `Distrito ${instituto.distritoId}`,
            nombre: instituto.nombre,
          };
        })
        .sort((a, b) => {
          if (a.regionOrden !== b.regionOrden) return a.regionOrden - b.regionOrden;
          const distritoCompare = a.distrito.localeCompare(b.distrito);
          if (distritoCompare !== 0) return distritoCompare;
          return a.nombre.localeCompare(b.nombre);
        }),
    [cohorte?.institutos, institutosMeta]
  );

  const institutosColumns: GridColDef[] = [
    { field: "region", headerName: "Region", width: 110 },
    { field: "distrito", headerName: "Distrito", flex: 1, minWidth: 200 },
    { field: "nombre", headerName: "Instituto", flex: 1.5, minWidth: 260 },
  ];

  if (loading && !cohorte) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!cohorte) return null;

  const estadoMeta = getEstadoCohorteMeta(cohorte.estado);

  return (
    <>
      <BackButton backUrl="/gestion/cohortes" />
      <Box px={3} py={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          mb={3}
          spacing={1}
        >
          <Typography variant="h5" fontWeight={600}>
            {cohorte.nombre}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Pill label={estadoMeta.label} color={estadoMeta.color} variant="filled" />
            <Button variant="outlined" size="small" onClick={() => router.push(`/gestion/inscripciones?cohorteId=${cohorte.id}`)}>
              Ver inscripciones
            </Button>
          </Stack>
        </Stack>

        <Stack mb={3}>
          <Accordion defaultExpanded className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Informacion general</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap" mb={2}>
                <Box flex={4}>
                  <Typography variant="body2" color="text.secondary">
                    Postitulo
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.postitulo?.nombre || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Ano
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.anio}</Typography>
                </Box>
                <Box flex={2}>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad de aulas
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.cantidadAulas || "-"}</Typography>
                </Box>
                <Box flex={2}>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad de cursantes
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.cantidadInscriptos || "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={3}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Institutos asignados</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!institutosRows.length ? (
                <Typography color="text.secondary">No hay institutos asignados.</Typography>
              ) : (
                <Box sx={{ width: "100%", minHeight: 420 }}>
                  <DataGrid
                    rows={institutosRows}
                    columns={institutosColumns}
                    disableRowSelectionOnClick
                    initialState={{
                      sorting: {
                        sortModel: [{ field: "region", sort: "asc" }],
                      },
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    localeText={{
                      noRowsLabel: "No hay institutos asignados.",
                    }}
                  />
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={3}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Evolucion mensual</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CohorteSnapshotsSection cohorteId={cohorte.id} />
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={3}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Fechas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Inicio cohorte
                  </Typography>
                  <Typography fontWeight={500}>{formatDate(cohorte.fechaInicio)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Fin cohorte
                  </Typography>
                  <Typography fontWeight={500}>{formatDate(cohorte.fechaFin)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Inicio inscripcion
                  </Typography>
                  <Typography fontWeight={500}>{formatDate(cohorte.fechaInicioInscripcion)}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Fin inscripcion
                  </Typography>
                  <Typography fontWeight={500}>{formatDate(cohorte.fechaFinInscripcion)}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={3}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Cupos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Cupos
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.cupos ?? "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Lista de espera
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.cuposListaEspera ?? "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Cupos totales
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.cuposTotales ?? "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    </>
  );
}
