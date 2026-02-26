"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import AddIcon from "@mui/icons-material/Add";
import BackButton from "@/components/ui/BackButton";
import api from "@/services/api";
import { Cursante } from "@/types/cursante";
import { Aula } from "@/types/aula";
import Pill from "@/components/ui/Pill";
import {
  getDocumentacionCursanteMeta,
  getEstadoCohorteMeta,
  getEstadoCursanteMeta,
} from "@/constants/pillColor";
import { appToast } from "@/utils/toast";
import AssignAulaDialog from "./components/AssignAulaDialog";

interface CursanteApiResponse {
  success: boolean;
  message: string;
  data: Cursante;
}

interface AulasApiResponse {
  success: boolean;
  message: string;
  data: Aula[];
}

export default function CursanteDetailPage() {
  const { id } = useParams();
  const cursanteId = Number(id);

  const [cursante, setCursante] = useState<Cursante | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAssign, setOpenAssign] = useState(false);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);

  const getCursante = async () => {
    if (Number.isNaN(cursanteId)) return;

    try {
      setLoading(true);
      const res = await api.get<CursanteApiResponse>(`/cursantes/${cursanteId}`);
      setCursante(res.data.data);
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  const getAulas = async () => {
    try {
      setLoadingAulas(true);
      const res = await api.get<AulasApiResponse>("/aulas");
      setAulas(res.data.data ?? []);
    } catch {
      appToast.error("No se pudieron cargar las aulas");
    } finally {
      setLoadingAulas(false);
    }
  };

  useEffect(() => {
    getCursante();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursanteId]);

  useEffect(() => {
    if (!openAssign) return;
    getAulas();
  }, [openAssign]);

  const assignedAulaCodes = useMemo(
    () =>
      (cursante?.inscripciones ?? [])
        .map((insc) => insc.aula?.codigo ?? "")
        .filter((code) => code.trim().length > 0),
    [cursante]
  );

  const handleAssignAula = async (aulaId: number) => {
    if (Number.isNaN(cursanteId)) return;

    try {
      await api.post(`/cursantes/${cursanteId}/asignar-aula`, { aulaId });
      appToast.success("Aula asignada correctamente");
      setOpenAssign(false);
      await getCursante();
    } catch {
      appToast.error("No se pudo asignar el aula");
    }
  };

  if (loading && !cursante) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!cursante) return null;

  return (
    <>
      <BackButton backUrl="/gestion/cursantes" />
      <Box px={3} py={2}>
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAssign(true)}>
            Asignar aula
          </Button>
        </Stack>

        <Stack mb={4}>
          <Accordion defaultExpanded className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography>
                  {cursante.nombre} {cursante.apellido}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" mb={3}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    DNI
                  </Typography>
                  <Typography fontWeight={500}>{cursante.dni || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography fontWeight={500}>{cursante.email || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Celular
                  </Typography>
                  <Typography fontWeight={500}>{cursante.celular || "-"}</Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                useFlexGap
                flexWrap="wrap"
                mb={3}
              >
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Titulo
                  </Typography>
                  <Typography fontWeight={500}>{cursante.titulo || "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {cursante.inscripciones.map((insc) => (
          <Stack key={insc.id} mb={4}>
            <Accordion className="customAccordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Typography>{insc.aula?.codigo}</Typography>

                  <Pill
                    label={getEstadoCohorteMeta(insc.aula?.cohorte.estado).label}
                    color={getEstadoCohorteMeta(insc.aula?.cohorte.estado).color}
                    variant="filled"
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" mb={3}>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Instituto
                    </Typography>
                    <Typography fontWeight={500}>{insc.aula?.instituto.nombre}</Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Estado cursante
                    </Typography>

                    <Pill
                      label={getEstadoCursanteMeta(insc.estado).label}
                      color={getEstadoCursanteMeta(insc.estado).color}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Documentacion
                    </Typography>

                    <Pill
                      label={getDocumentacionCursanteMeta(insc.documentacion).label}
                      color={getDocumentacionCursanteMeta(insc.documentacion).color}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Observaciones
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem" }}>
                      {insc.observaciones || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        ))}
      </Box>

      <AssignAulaDialog
        open={openAssign}
        aulas={aulas}
        assignedAulaCodes={assignedAulaCodes}
        loadingAulas={loadingAulas}
        onClose={() => setOpenAssign(false)}
        onAssign={handleAssignAula}
      />
    </>
  );
}
