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
import {
  INSCRIPCION_DOCUMENTACIONES,
  INSCRIPCION_ESTADOS,
  DocumentacionInscripcion,
  EstadoInscripcionPrivada,
  useInscripcionDetail,
} from "@/features/inscripciones";
import {
  getDocumentacionCursanteMeta,
  getEstadoCohorteMeta,
  getEstadoInscripcionPrivadaMeta,
} from "@/constants/pillColor";
import { formatDate } from "@/shared/lib/date";

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={500}>{value || "-"}</Typography>
    </Box>
  );
}

const formatFieldLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

function RenderFieldValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <Typography>-</Typography>;
    return (
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {value.map((item, index) => (
          <Pill
            key={`${String(item)}-${index}`}
            label={String(item)}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Stack>
    );
  }

  if (typeof value === "boolean") {
    return <Typography>{value ? "Si" : "No"}</Typography>;
  }

  if (value === null || value === undefined || value === "") {
    return <Typography>-</Typography>;
  }

  if (typeof value === "object") {
    return (
      <Box
        component="pre"
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: "grey.100",
          overflowX: "auto",
          fontSize: 12,
          m: 0,
        }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    );
  }

  return <Typography>{String(value)}</Typography>;
}

export default function InscripcionDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const {
    inscripcion,
    loading,
    savingEstado,
    savingDocumentacion,
    savingObservaciones,
    openingDniDoc,
    openingTituloDoc,
    observacionesDraft,
    datosFormularioEntries,
    setObservacionesDraft,
    changeEstado,
    changeDocumentacion,
    openDocumento,
    saveObservaciones,
  } = useInscripcionDetail(id);

  const estadoMeta = useMemo(
    () => getEstadoInscripcionPrivadaMeta(inscripcion?.estado),
    [inscripcion?.estado]
  );

  const documentacionMeta = useMemo(
    () => getDocumentacionCursanteMeta(inscripcion?.documentacion),
    [inscripcion?.documentacion]
  );

  const handleEstadoChange = async (event: SelectChangeEvent<EstadoInscripcionPrivada>) => {
    await changeEstado(event.target.value as EstadoInscripcionPrivada);
  };

  const handleDocumentacionChange = async (
    event: SelectChangeEvent<DocumentacionInscripcion>
  ) => {
    await changeDocumentacion(event.target.value as DocumentacionInscripcion);
  };

  if (loading && !inscripcion) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!inscripcion) return null;

  return (
    <>
      <BackButton backUrl="/gestion/inscripciones" />
      <Box px={3} py={2}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={2}
              mb={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {inscripcion.apellido}, {inscripcion.nombre}
                </Typography>
                <Pill label={estadoMeta.label} color={estadoMeta.color} variant="filled" />
                <Pill label={documentacionMeta.label} color={documentacionMeta.color} />
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 230 }}>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  label="Estado"
                  value={inscripcion.estado}
                  onChange={handleEstadoChange}
                  disabled={savingEstado}
                >
                  {INSCRIPCION_ESTADOS.map((item) => (
                    <MenuItem key={item} value={item}>
                      {getEstadoInscripcionPrivadaMeta(item).label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 230 }}>
                <InputLabel id="documentacion-label">Documentacion</InputLabel>
                <Select
                  labelId="documentacion-label"
                  label="Documentacion"
                  value={inscripcion.documentacion}
                  onChange={handleDocumentacionChange}
                  disabled={savingDocumentacion}
                >
                  {INSCRIPCION_DOCUMENTACIONES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {getDocumentacionCursanteMeta(item).label}
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
              <DataItem label="DNI" value={inscripcion.dni} />
              <DataItem label="Email" value={inscripcion.email ?? "-"} />
              <DataItem label="Celular" value={inscripcion.celular ?? "-"} />
              <DataItem
                label="Prioridad"
                value={inscripcion.prioridad != null ? String(inscripcion.prioridad) : "-"}
              />
              <DataItem label="Lista de espera" value={inscripcion.listaEspera ? "Si" : "No"} />
              <DataItem label="Condicionada" value={inscripcion.condicionada ? "Si" : "No"} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Cohorte
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography fontWeight={600}>
                  {inscripcion.cohorte.nombre} ({inscripcion.cohorte.anio})
                </Typography>
                <Pill
                  label={getEstadoCohorteMeta(inscripcion.cohorte.estado).label}
                  color={getEstadoCohorteMeta(inscripcion.cohorte.estado).color}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {inscripcion.cohorte.postitulo.nombre} ({inscripcion.cohorte.postitulo.codigo})
              </Typography>
              <Typography variant="body2">
                Periodo de inscripcion:{" "}
                {inscripcion.cohorte.fechaInicioInscripcion
                  ? formatDate(inscripcion.cohorte.fechaInicioInscripcion, "short")
                  : "-"}{" "}
                al{" "}
                {inscripcion.cohorte.fechaFinInscripcion
                  ? formatDate(inscripcion.cohorte.fechaFinInscripcion, "short")
                  : "-"}
              </Typography>
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
                minRows={3}
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
                    savingObservaciones || observacionesDraft === (inscripcion.observaciones ?? "")
                  }
                >
                  Guardar observaciones
                </Button>
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                {inscripcion.dniAdjuntoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={openingDniDoc}
                    onClick={() => void openDocumento("dni")}
                  >
                    Ver DNI adjunto
                  </Button>
                )}

                {inscripcion.tituloAdjuntoUrl && (
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

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Datos de formulario
            </Typography>
            {datosFormularioEntries.length === 0 ? (
              <Typography color="text.secondary">Sin datos de formulario</Typography>
            ) : (
              <Stack spacing={2}>
                {datosFormularioEntries.map(([key, value]) => (
                  <Box key={key}>
                    <Typography variant="body2" color="text.secondary">
                      {formatFieldLabel(key)}
                    </Typography>
                    <RenderFieldValue value={value} />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </>
  );
}
