"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import api from "@/shared/api/client";
import { CursanteDetalleAula, DocumentacionCursante, EstadoCursante } from "@/types/cursante";
import { getDocumentacionCursanteMeta, getEstadoCursanteMeta } from "@/constants/pillColor";
import { appToast } from "@/shared/lib/toast";
import { formatDate } from "@/shared/lib/date";

interface CursanteAulaDetalleApiResponse {
  success: boolean;
  message: string;
  data: CursanteDetalleAula;
}

interface SignedDocumentoResponse {
  success: boolean;
  data: {
    bucket: string;
    path: string;
    signedUrl: string;
    expiresIn: number;
  };
}

interface CursanteAulaPatchApiResponse {
  success: boolean;
  message: string;
  data:
    | CursanteDetalleAula["inscripcionAula"]
    | {
        inscripcionAula: CursanteDetalleAula["inscripcionAula"];
      };
}

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

const ESTADOS: EstadoCursante[] = ["ACTIVO", "ADEUDA", "BAJA"];
const DOCUMENTACIONES: DocumentacionCursante[] = ["VERIFICADA", "PENDIENTE", "NO_CORRESPONDE"];

export default function AulaCursanteDetailPage() {
  const params = useParams<{ id: string; cursanteId: string }>();
  const searchParams = useSearchParams();
  const aulaId = Number(params.id);
  const cursanteId = Number(params.cursanteId);
  const aulaNombre = searchParams.get("aulaNombre");

  const [detail, setDetail] = useState<CursanteDetalleAula | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingObservaciones, setSavingObservaciones] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingDocumentacion, setSavingDocumentacion] = useState(false);
  const [openingDniDoc, setOpeningDniDoc] = useState(false);
  const [openingTituloDoc, setOpeningTituloDoc] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState("");

  const getDetail = async () => {
    if (Number.isNaN(aulaId) || Number.isNaN(cursanteId)) return;

    try {
      setLoading(true);
      const response = await api.get<CursanteAulaDetalleApiResponse>(
        `/aulas/${aulaId}/cursantes/${cursanteId}`
      );
      const nextDetail = response.data.data;
      setDetail(nextDetail);
      setObservacionesDraft(nextDetail.inscripcionAula.observaciones ?? "");
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404) {
        appToast.error("El cursante no pertenece a esta aula");
      } else {
        appToast.error("No se pudo cargar el detalle del cursante");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaId, cursanteId]);

  const estadoMeta = useMemo(
    () => getEstadoCursanteMeta(detail?.inscripcionAula.estado as EstadoCursante | undefined),
    [detail?.inscripcionAula.estado]
  );
  const documentacionMeta = useMemo(
    () =>
      getDocumentacionCursanteMeta(
        detail?.inscripcionAula.documentacion as DocumentacionCursante | undefined
      ),
    [detail?.inscripcionAula.documentacion]
  );

  const handleSaveObservaciones = async () => {
    if (!detail) return;

    const previousObservaciones = detail.inscripcionAula.observaciones ?? "";
    if (observacionesDraft === previousObservaciones) return;

    setSavingObservaciones(true);
    try {
      const response = await api.patch<CursanteAulaPatchApiResponse>(
        `/aulas/${aulaId}/cursantes/${cursanteId}`,
        {
          observaciones: observacionesDraft,
        }
      );

      const payload =
        "inscripcionAula" in response.data.data
          ? response.data.data.inscripcionAula
          : response.data.data;

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: {
                ...prev.inscripcionAula,
                ...payload,
              },
            }
          : prev
      );
      setObservacionesDraft(payload.observaciones ?? "");
      appToast.success("Observaciones guardadas");
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 400) {
        appToast.error("No se pudieron guardar las observaciones");
      } else if (status === 404) {
        appToast.error("El cursante no pertenece a esta aula");
      } else {
        appToast.error("No se pudieron guardar las observaciones");
      }
    } finally {
      setSavingObservaciones(false);
    }
  };

  const handleEstadoChange = async (event: SelectChangeEvent<EstadoCursante>) => {
    if (!detail) return;

    const previousEstado = detail.inscripcionAula.estado;
    const newEstado = event.target.value as EstadoCursante;
    if (newEstado === previousEstado) return;

    setDetail((prev) =>
      prev
        ? {
            ...prev,
            inscripcionAula: { ...prev.inscripcionAula, estado: newEstado },
          }
        : prev
    );
    setSavingEstado(true);

    try {
      await api.patch(`/aulas/${aulaId}/cursantes/${cursanteId}/estado`, {
        estado: newEstado,
      });
    } catch {
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: { ...prev.inscripcionAula, estado: previousEstado },
            }
          : prev
      );
      appToast.error("No se pudo actualizar el estado");
    } finally {
      setSavingEstado(false);
    }
  };

  const handleDocumentacionChange = async (event: SelectChangeEvent<DocumentacionCursante>) => {
    if (!detail) return;

    const previousDocumentacion = detail.inscripcionAula.documentacion;
    const newDocumentacion = event.target.value as DocumentacionCursante;
    if (newDocumentacion === previousDocumentacion) return;

    setDetail((prev) =>
      prev
        ? {
            ...prev,
            inscripcionAula: {
              ...prev.inscripcionAula,
              documentacion: newDocumentacion,
            },
          }
        : prev
    );
    setSavingDocumentacion(true);

    try {
      await api.patch(`/aulas/${aulaId}/cursantes/${cursanteId}/documentacion`, {
        documentacion: newDocumentacion,
      });
    } catch {
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: {
                ...prev.inscripcionAula,
                documentacion: previousDocumentacion,
              },
            }
          : prev
      );
      appToast.error("No se pudo actualizar la documentacion");
    } finally {
      setSavingDocumentacion(false);
    }
  };

  const openSignedDocumento = async (
    tipo: "dni" | "titulo",
    setLoadingState: (value: boolean) => void
  ) => {
    setLoadingState(true);
    try {
      const response = await api.get<SignedDocumentoResponse>(
        `/aulas/${aulaId}/cursantes/${cursanteId}/documentos/${tipo}/url`,
        { params: { expiresIn: 600 } }
      );
      const signedUrl = response.data.data?.signedUrl;
      if (!signedUrl) {
        appToast.error("No se pudo obtener la URL del documento");
        return;
      }

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      appToast.error("No se pudo abrir el documento");
    } finally {
      setLoadingState(false);
    }
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
              <DataItem
                label="Región"
                value={cursante.distrito?.regionId ?? cursante.regionId ?? "-"}
              />
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
                  onClick={handleSaveObservaciones}
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
                    onClick={() => openSignedDocumento("dni", setOpeningDniDoc)}
                  >
                    Ver DNI adjunto
                  </Button>
                )}

                {inscripcionAula.tituloAdjuntoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={openingTituloDoc}
                    onClick={() => openSignedDocumento("titulo", setOpeningTituloDoc)}
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
