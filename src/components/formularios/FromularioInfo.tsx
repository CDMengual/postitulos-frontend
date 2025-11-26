"use client";

import { Box, Paper, Stack, Typography, Link, Divider } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { Formulario } from "@/types/formulario";
import { CohortePublica } from "@/types/cohorte";
import { requisitosPorPostitulo } from "@/constants/requisitosPostitulo";
import { formatDate } from "@/utils/date";

interface Props {
  formulario: Formulario;
  cohorte: CohortePublica;
}

export default function FormularioInfo({ formulario, cohorte }: Props) {
  const postitulo = cohorte.postitulo;
  const requisitos = requisitosPorPostitulo[String(postitulo?.id ?? "")] ?? {
    excluyentes: [],
  };
  const periodo =
    cohorte.fechaInicioInscripcion && cohorte.fechaFinInscripcion
      ? `${formatDate(cohorte.fechaInicioInscripcion, "short")} al ${formatDate(
          cohorte.fechaFinInscripcion,
          "short"
        )}`
      : null;

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4 }}>
      <Stack spacing={4}>
        {/* Header con saludo */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            color="primary.main"
            gutterBottom
          >
            Preinscripción
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            Por favor, lee atentamente los requisitos detallados y completa
            todos los datos solicitados para tu postulación.
          </Typography>
        </Box>

        <Divider />

        {/* Información del postítulo */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <SchoolIcon sx={{ fontSize: 28, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Información del postítulo
            </Typography>
          </Stack>

          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontSize={13}
                mb={0.5}
              >
                Título
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {postitulo?.tipos?.[0]?.titulo || postitulo?.nombre}
              </Typography>
            </Box>

            {postitulo?.resolucion && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontSize={13}
                  mb={0.5}
                >
                  Resolución
                </Typography>
                <Typography variant="body1">{postitulo.resolucion}</Typography>
              </Box>
            )}

            {postitulo?.planEstudios && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontSize={13}
                  mb={0.5}
                >
                  Plan de Estudios
                </Typography>
                <Link
                  href={postitulo.planEstudios}
                  target="_blank"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  <DescriptionOutlinedIcon fontSize="small" />
                  Descargar programa
                </Link>
              </Box>
            )}

            {postitulo?.destinatarios && (
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  mb={0.5}
                >
                  <PeopleAltOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontSize={13}
                  >
                    Destinatarios
                  </Typography>
                </Stack>
                <Typography variant="body1">
                  {postitulo.destinatarios}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Período de inscripción */}
        {periodo && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e5e5",
              boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <EventAvailableIcon
                sx={{ color: "primary.main", fontSize: 24 }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  fontWeight={600}
                  fontSize={13}
                >
                  PERÍODO DE INSCRIPCIÓN
                </Typography>
                <Typography variant="body2" color="text.primary" mt={0.3}>
                  {periodo} o hasta agotar cupos
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Requisitos excluyentes */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e5e5",
              boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <CheckCircleOutlineIcon
                sx={{ color: "primary.main", fontSize: 26 }}
              />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Requisitos excluyentes
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {requisitos.excluyentes.map((req, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      mt: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" lineHeight={1.7}>
                    {req}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Requisitos prioritarios */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e5e5",
              boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <CheckCircleOutlineIcon
                sx={{ color: "info.main", fontSize: 26 }}
              />
              <Typography variant="h6" fontWeight={600} color="primary.main">
                Requisitos prioritarios
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {formulario.campos
                .find((c) => c.id === "requisitos_prioritarios")
                ?.options?.filter((opt) => opt !== "No")
                .map((req, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        mt: 1,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.primary"
                      lineHeight={1.7}
                    >
                      {req}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </Paper>
        </Box>

        {/* Nota importante */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #e5e5e5",
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <InfoOutlinedIcon sx={{ color: "warning.main", fontSize: 24 }} />
            <Box>
              <Typography
                variant="subtitle2"
                color="warning.main"
                fontWeight={600}
                fontSize={13}
              >
                Importante
              </Typography>
              <Typography variant="body2" color="text.primary" mt={0.3}>
                Completar este formulario no garantiza la vacante. Una vez
                procesada la información, se te asignará un ISFD/ISFDyT sede y
                nos comunicaremos a través del correo electrónico registrado.
                Para completar la inscripción, deberás enviar la documentación
                requerida a la sede correspondiente, donde será validada.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
