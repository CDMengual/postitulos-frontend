"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BackButton from "@/shared/components/ui/BackButton";
import Pill from "@/shared/components/ui/Pill";
import { useAulaCursanteDetail } from "@/features/aulas";
import { DocumentacionCursante, EstadoCursante } from "@/features/cursantes";
import { getDocumentacionCursanteMeta, getEstadoCursanteMeta } from "@/constants/pillColor";
import { formatDate } from "@/shared/lib/date";

const ESTADOS: EstadoCursante[] = ["ACTIVO", "ADEUDA", "BAJA"];
const DOCUMENTACIONES: DocumentacionCursante[] = ["VERIFICADA", "PENDIENTE", "NO_CORRESPONDE"];

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={500}>{value || "-"}</Typography>
    </Box>
  );
}

export default function AulaCursanteDetailPage() {
  const params = useParams<{ id: string; cursanteId: string }>();
  const aulaId = Number(params.id);
  const cursanteId = Number(params.cursanteId);
  const {
    detail,
    loading,
    savingObservaciones,
    savingEstado,
    savingDocumentacion,
    openingDniDoc,
    openingTituloDoc,
    observacionesDraft,
    setObservacionesDraft,
    changeEstado,
    changeDocumentacion,
    saveObservaciones,
    openDocumento,
    estadoValue,
    documentacionValue,
  } = useAulaCursanteDetail(aulaId, cursanteId);

  const estadoMeta = useMemo(
    () => getEstadoCursanteMeta(estadoValue as EstadoCursante | undefined),
    [estadoValue]
  );
  const documentacionMeta = useMemo(
    () => getDocumentacionCursanteMeta(documentacionValue as DocumentacionCursante | undefined),
    [documentacionValue]
  );

  const handleEstadoChange = async (event: SelectChangeEvent<EstadoCursante>) => {
    await changeEstado(event.target.value as EstadoCursante);
  };

  const handleDocumentacionChange = async (event: SelectChangeEvent<DocumentacionCursante>) => {
    await changeDocumentacion(event.target.value as DocumentacionCursante);
  };

  if (loading && !detail) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!detail) return null;

  const { cursante, inscripcionAula } = detail;

  return (
    <>
      <BackButton backUrl={`/gestion/aulas/${aulaId}`} />
      <Box px={3} py={2}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap>
                <Typography variant="h5" fontWeight={700}>
                  {cursante.apellido}, {cursante.nombre}
                </Typography>
                <Pill label={estadoMeta.label} color={estadoMeta.color} variant="filled" />
                <Pill label={documentacionMeta.label} color={documentacionMeta.color} />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {inscripcionAula.aula?.codigo || "-"}
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="estado-aula-cursante-label">Estado</InputLabel>
                <Select
                  labelId="estado-aula-cursante-label"
                  label="Estado"
                  value={inscripcionAula.estado}
                  onChange={handleEstadoChange}
                  disabled={savingEstado}
                >
                  {ESTADOS.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                      {getEstadoCursanteMeta(estado).label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="documentacion-aula-cursante-label">Documentacion</InputLabel>
                <Select
                  labelId="documentacion-aula-cursante-label"
                  label="Documentacion"
                  value={inscripcionAula.documentacion}
                  onChange={handleDocumentacionChange}
                  disabled={savingDocumentacion}
                >
                  {DOCUMENTACIONES.map((documentacion) => (
                    <MenuItem key={documentacion} value={documentacion}>
                      {getDocumentacionCursanteMeta(documentacion).label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Datos personales
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} useFlexGap flexWrap="wrap">
              <DataItem label="DNI" value={cursante.dni} />
              <DataItem label="Email" value={cursante.email ?? "-"} />
              <DataItem label="Celular" value={cursante.celular ?? "-"} />
              <DataItem label="Titulo" value={cursante.titulo ?? "-"} />
              <DataItem label="Region" value={cursante.distrito?.regionId ?? cursante.regionId ?? "-"} />
              <DataItem label="Distrito" value={cursante.distrito?.nombre ?? "-"} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Inscripcion en aula
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} useFlexGap flexWrap="wrap">
              <DataItem
                label="Fecha de alta"
                value={inscripcionAula.createdAt ? formatDate(inscripcionAula.createdAt) : "-"}
              />
              <DataItem
                label="Ultima actualizacion"
                value={inscripcionAula.updatedAt ? formatDate(inscripcionAula.updatedAt) : "-"}
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Observaciones y adjuntos
            </Typography>

            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Observaciones
              </Typography>

              <TextField
                multiline
                minRows={4}
                value={observacionesDraft}
                onChange={(event) => setObservacionesDraft(event.target.value)}
                placeholder="Agregar observaciones internas"
              />

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => void saveObservaciones()}
                  disabled={
                    savingObservaciones ||
                    observacionesDraft === (inscripcionAula.observaciones ?? "")
                  }
                >
                  Guardar observaciones
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap>
                {inscripcionAula.dniAdjuntoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={openingDniDoc}
                    onClick={() => void openDocumento("dni")}
                  >
                    Ver DNI adjunto
                  </Button>
                )}

                {inscripcionAula.tituloAdjuntoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={openingTituloDoc}
                    onClick={() => void openDocumento("titulo")}
                  >
                    Ver titulo adjunto
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </>
  );
}
