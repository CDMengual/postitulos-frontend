"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "@/services/api";
import BackButton from "@/components/ui/BackButton";
import { Postitulo } from "@/types/postitulo";
import { getPostituloTypeMeta } from "@/constants/pillColor";
import { getPostituloColor } from "@/constants/postitulosColors";
import Pill from "@/components/ui/Pill";

export default function PostituloDetailPage() {
  const { id } = useParams();
  const [postitulo, setPostitulo] = useState<Postitulo | null>(null);

  const getPostitulo = async () => {
    try {
      const res = await api.get(`/postitulos/${id}`);
      setPostitulo(res.data.data);
    } catch (err) {
      console.error("Error al obtener postitulo:", err);
    }
  };

  useEffect(() => {
    getPostitulo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!postitulo) return null;

  const requisitosExcluyentes = postitulo.requisitos?.excluyentes ?? [];
  const requisitosPrioritarios = postitulo.requisitos?.prioritarios ?? [];
  const hasRequisitos = requisitosExcluyentes.length > 0 || requisitosPrioritarios.length > 0;

  return (
    <>
      <BackButton />
      <Box px={3} py={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
          spacing={10}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              {postitulo.nombre}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {postitulo.tipos?.map((tipo) => {
              const meta = getPostituloTypeMeta(tipo.tipo);
              return <Pill key={tipo.id} label={meta.label} color={meta.color} variant="filled" />;
            })}
          </Stack>
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
                <Typography>Informacion general</Typography>
                {postitulo.codigo && (
                  <Pill
                    label={postitulo.codigo}
                    color={getPostituloColor(postitulo.codigo)}
                    variant="outlined"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" mb={3}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Resolucion
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.resolucion || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Resolucion puntaje
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.resolucionPuntaje || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Dictamen
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.dictamen || "-"}</Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} useFlexGap flexWrap="wrap">
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Carga horaria total
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.cargaHoraria || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Horas sincronicas
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.horasSincronicas || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Horas virtuales
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.horasVirtuales || "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={4}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Titulo</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                {postitulo.tipos?.map((tipo) => (
                  <Box key={tipo.id} mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      {getPostituloTypeMeta(tipo.tipo).label}
                    </Typography>
                    <Typography fontWeight={500}>{tipo.titulo}</Typography>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={4}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Equipo academico</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Coordinadores
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.coordinadores || "-"}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Autores
                  </Typography>
                  <Typography fontWeight={500}>{postitulo.autores || "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        <Stack mb={4}>
          <Accordion className="customAccordion">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Descripción y destinatarios</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0} flexWrap="wrap">
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography mb={2}>{postitulo.descripcion || "-"}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Destinatarios
                  </Typography>
                  <Typography mb={2}>{postitulo.destinatarios || "-"}</Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {hasRequisitos && (
          <Stack mb={4}>
            <Accordion className="customAccordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Requisitos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  {requisitosExcluyentes.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Requisitos excluyentes
                      </Typography>
                      <Stack>
                        {requisitosExcluyentes.map((req, index) => (
                          <Typography key={index}>{req}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {requisitosPrioritarios.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Requisitos prioritarios
                      </Typography>
                      <Stack>
                        {requisitosPrioritarios.map((req, index) => (
                          <Typography key={index}>{req}</Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}
      </Box>
    </>
  );
}
