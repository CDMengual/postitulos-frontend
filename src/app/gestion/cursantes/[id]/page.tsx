"use client";

import { useEffect, useState } from "react";
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
import BackButton from "@/shared/components/ui/BackButton";
import Pill from "@/shared/components/ui/Pill";
import { AssignAulaDialog, useCursanteDetail } from "@/features/cursantes";
import {
  getDocumentacionCursanteMeta,
  getEstadoCohorteMeta,
  getEstadoCursanteMeta,
} from "@/constants/pillColor";

export default function CursanteDetailPage() {
  const { id } = useParams();
  const cursanteId = Number(id);
  const [openAssign, setOpenAssign] = useState(false);
  const {
    cursante,
    aulas,
    loading,
    loadingAulas,
    assignedAulaCodes,
    estadoInscripcionActual,
    loadAulas,
    assignAula,
  } = useCursanteDetail(cursanteId);

  useEffect(() => {
    if (openAssign) {
      void loadAulas();
    }
  }, [loadAulas, openAssign]);

  if (loading && !cursante) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!cursante) return null;

  const puedeAsignarAula = estadoInscripcionActual === "ADMITIDO";
  const regionId = cursante.distrito?.regionId ?? cursante.regionId;

  return (
    <>
      <BackButton backUrl="/gestion/cursantes" />
      <Box px={3} py={2}>
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAssign(true)}
            disabled={!puedeAsignarAula}
          >
            Asignar aula
          </Button>
        </Stack>

        {!puedeAsignarAula && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Solo se pueden asignar aulas a cursantes con estado de inscripcion &quot;Admitido&quot;.
            </Typography>
          </Box>
        )}

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
                <Box flex={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Region
                  </Typography>
                  <Typography fontWeight={500}>
                    {regionId !== null && regionId !== undefined ? String(regionId) : "-"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Distrito
                  </Typography>
                  <Typography fontWeight={500}>{cursante.distrito?.nombre || "-"}</Typography>
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

        {(cursante.inscripciones ?? []).map((inscripcion) => (
          <Stack key={inscripcion.id} mb={4}>
            <Accordion className="customAccordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Typography>{inscripcion.aula?.codigo}</Typography>
                  <Pill
                    label={getEstadoCohorteMeta(inscripcion.aula?.cohorte.estado).label}
                    color={getEstadoCohorteMeta(inscripcion.aula?.cohorte.estado).color}
                    variant="filled"
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" mb={3}>
                  <Box flex={2}>
                    <Typography variant="body2" color="text.secondary">
                      Postitulo
                    </Typography>
                    <Typography fontWeight={500}>
                      {inscripcion.aula?.cohorte.postitulo.nombre || "-"}
                    </Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Instituto
                    </Typography>
                    <Typography fontWeight={500}>{inscripcion.aula?.instituto.nombre}</Typography>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Estado de cursada
                    </Typography>
                    <Pill
                      label={getEstadoCursanteMeta(inscripcion.estado).label}
                      color={getEstadoCursanteMeta(inscripcion.estado).color}
                    />
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Documentacion
                    </Typography>
                    <Pill
                      label={getDocumentacionCursanteMeta(inscripcion.documentacion).label}
                      color={getDocumentacionCursanteMeta(inscripcion.documentacion).color}
                    />
                  </Box>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Observaciones
                    </Typography>
                    <Typography sx={{ fontSize: "0.875rem" }}>
                      {inscripcion.observaciones || "-"}
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
        onAssign={async (aulaId) => {
          await assignAula(aulaId);
          setOpenAssign(false);
        }}
      />
    </>
  );
}
