"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BackButton from "@/components/ui/BackButton";
import api from "@/services/api";
import { Cursante } from "@/types/cursante";
import Pill from "@/components/ui/Pill";
import {
  getDocumentacionCursanteMeta,
  getEstadoCohorteMeta,
  getEstadoCursanteMeta,
} from "@/constants/pillColor";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Cursante;
}

export default function CursanteDetailPage() {
  const { id } = useParams();
  const [cursante, setCursante] = useState<Cursante | null>(null);
  const [loading, setLoading] = useState(true);

  const getCursante = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse>(`/cursantes/${id}`);
      setCursante(res.data.data);
      console.log("data cursante", res.data.data);
    } catch (err) {
      console.error("Error al obtener usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getCursante();
  }, [id]);

  if (!cursante) return null;

  return (
    <>
      <BackButton backUrl="/gestion/cursantes" />
      <Box px={3} py={2}>
        {/* 🧍 Información general */}
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
                  {" "}
                  {cursante.nombre} {cursante.apellido}{" "}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                flexWrap="wrap"
                mb={3}
              >
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    DNI
                  </Typography>
                  <Typography fontWeight={500}>
                    {cursante.dni || "-"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography fontWeight={500}>
                    {cursante.email || "-"}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Celular
                  </Typography>
                  <Typography fontWeight={500}>
                    {cursante.celular || "-"}
                  </Typography>
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
                    Título
                  </Typography>
                  <Typography fontWeight={500}>
                    {cursante.titulo || "-"}
                  </Typography>
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
                    label={
                      getEstadoCohorteMeta(insc.aula?.cohorte.estado).label
                    }
                    color={
                      getEstadoCohorteMeta(insc.aula?.cohorte.estado).color
                    }
                    variant="filled"
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  flexWrap="wrap"
                  mb={3}
                >
                  {/* Instituto */}
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Instituto
                    </Typography>
                    <Typography fontWeight={500}>
                      {insc.aula?.instituto.nombre}
                    </Typography>
                  </Box>

                  {/* Estado cursante */}
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Estado cursante
                    </Typography>

                    <Pill
                      label={getEstadoCursanteMeta(insc.estado).label}
                      color={getEstadoCursanteMeta(insc.estado).color}
                    />
                  </Box>

                  {/* Documentación */}
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Documentación
                    </Typography>

                    <Pill
                      label={
                        getDocumentacionCursanteMeta(insc.documentacion).label
                      }
                      color={
                        getDocumentacionCursanteMeta(insc.documentacion).color
                      }
                    />
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  flexWrap="wrap"
                >
                  {/* Observaciones */}
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
    </>
  );
}
