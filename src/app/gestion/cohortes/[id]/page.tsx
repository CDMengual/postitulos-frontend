"use client";

import { useEffect, useState } from "react";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BackButton from "@/components/ui/BackButton";
import Pill from "@/components/ui/Pill";
import api from "@/services/api";
import { Cohorte } from "@/types/cohorte";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import { appToast } from "@/utils/toast";
import { Instituto } from "@/types/instituto";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Cohorte;
}

interface InstitutosResponse {
  success: boolean;
  message: string;
  data: Instituto[];
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR").format(date);
};

export default function CohorteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cohorte, setCohorte] = useState<Cohorte | null>(null);
  const [institutosMeta, setInstitutosMeta] = useState<Record<number, Instituto>>({});
  const [loading, setLoading] = useState(true);

  const getCohorte = async () => {
    try {
      setLoading(true);
      const [cohorteRes, institutosRes] = await Promise.all([
        api.get<ApiResponse>(`/cohortes/${id}`),
        api.get<InstitutosResponse>("/institutos"),
      ]);
      setCohorte(cohorteRes.data.data);

      const map = (institutosRes.data.data || []).reduce<Record<number, Instituto>>(
        (acc, instituto) => {
          acc[instituto.id] = instituto;
          return acc;
        },
        {}
      );
      setInstitutosMeta(map);
    } catch {
      appToast.error("No se pudo cargar la cohorte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCohorte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push(`/gestion/inscripciones?cohorteId=${cohorte.id}`)}
            >
              Ver inscripciones
            </Button>
          </Stack>
        </Stack>

        <Stack mb={3}>
          <Accordion defaultExpanded className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Información general</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap" mb={2}>
                <Box flex={4}>
                  <Typography variant="body2" color="text.secondary">
                    Postítulo
                  </Typography>
                  <Typography fontWeight={500}>{cohorte.postitulo?.nombre || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Año
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
              {!cohorte.institutos?.length ? (
                <Typography color="text.secondary">No hay institutos asignados.</Typography>
              ) : (
                <Stack spacing={2}>
                  {[...cohorte.institutos]
                    .sort((a, b) => {
                      const regionA = institutosMeta[a.id]?.regionId ?? Number.MAX_SAFE_INTEGER;
                      const regionB = institutosMeta[b.id]?.regionId ?? Number.MAX_SAFE_INTEGER;
                      if (regionA !== regionB) return regionA - regionB;

                      const distritoA = institutosMeta[a.id]?.distritoNombre || "";
                      const distritoB = institutosMeta[b.id]?.distritoNombre || "";
                      return distritoA.localeCompare(distritoB);
                    })
                    .map((instituto) => {
                      const meta = institutosMeta[instituto.id];
                      const distrito = meta?.distritoNombre || `Distrito ${instituto.distritoId}`;
                      const region =
                        meta?.regionId !== null && meta?.regionId !== undefined
                          ? `${meta.regionId}`
                          : "-";

                      return (
                        <Box
                          key={instituto.id}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 2,
                          }}
                        >
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                            <Box flex={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                Región
                              </Typography>
                              <Typography fontWeight={500}>{region}</Typography>
                            </Box>
                            <Box flex={1}>
                              <Typography variant="body2" color="text.secondary">
                                Distrito
                              </Typography>
                              <Typography fontWeight={500}>{distrito}</Typography>
                            </Box>
                            <Box flex={2}>
                              <Typography variant="body2" color="text.secondary">
                                Instituto
                              </Typography>
                              <Typography fontWeight={500}>{instituto.nombre}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                </Stack>
              )}
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
                    Inicio inscripción
                  </Typography>
                  <Typography fontWeight={500}>
                    {formatDate(cohorte.fechaInicioInscripcion)}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Fin inscripción
                  </Typography>
                  <Typography fontWeight={500}>
                    {formatDate(cohorte.fechaFinInscripcion)}
                  </Typography>
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
