"use client";

import { useEffect, useState } from "react";
import { Select, MenuItem, Box, Typography, Paper, Stack, Container, Alert } from "@mui/material";
import api from "@/services/api";
import { CohortePublica } from "@/types/cohorte";
import Formulario from "@/components/formularios/Fromulario";
import { formatDate } from "@/utils/date";

interface ApiDataResponse<T> {
  data: T;
}

export default function InscripcionPublicaPage() {
  const [cohortes, setCohortes] = useState<CohortePublica[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detalle, setDetalle] = useState<CohortePublica | null>(null);

  useEffect(() => {
    const fetchCohortes = async () => {
      try {
        const res = await api.get<ApiDataResponse<CohortePublica[]>>(
          "/public/cohortes-en-inscripcion"
        );
        setCohortes(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCohortes();
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    const cohorteSeleccionada = cohortes.find((c) => String(c.id) === id) ?? null;
    setDetalle(cohorteSeleccionada);
  };

  return (
    <Container maxWidth="md" sx={{ mb: 6 }}>
      <Stack alignItems="center" spacing={2} mt={6} mb={4}>
        <Box
          component="img"
          src="/assets/logos/banner_pba.svg"
          alt="Logo PBA"
          sx={{ height: 100 }}
        />
      </Stack>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Inscripción a Postítulos
        </Typography>

        <Box mt={3}>
          <Typography variant="body1" mb={1}>
            Seleccioná el postítulo:
          </Typography>

          <Select
            fullWidth
            value={selected}
            displayEmpty
            onChange={(e) => handleSelect(e.target.value as string)}
          >
            <MenuItem value="" disabled>
              Elegí una cohorte
            </MenuItem>

            {cohortes.map((c) => (
              <MenuItem value={String(c.id)} key={c.id}>
                {c.postitulo.nombre} - Cohorte {c.anio}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {detalle && (
        <Box mt={4}>
          {(() => {
            const inicio = detalle.fechaInicioInscripcion
              ? formatDate(detalle.fechaInicioInscripcion, "long", {
                  timeZone: "UTC",
                })
              : "";
            const fin = detalle.fechaFinInscripcion
              ? formatDate(detalle.fechaFinInscripcion, "long", {
                  timeZone: "UTC",
                })
              : "";
            const cuposInscripcionDisponibles =
              detalle.cuposDisponibles + detalle.cuposEsperaDisponibles;

            if (detalle.fueraDePeriodoInscripcion || !detalle.enPeriodoInscripcion) {
              return (
                <Alert severity="info" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>La inscripción no se encuentra abierta.</Typography>
                  <Typography variant="body2" mt={0.5}>
                    Período habilitado: <strong>{inicio}</strong> al <strong>{fin}</strong>.
                  </Typography>
                </Alert>
              );
            }

            if (detalle.sinCuposDisponibles || !detalle.tieneCuposDisponibles) {
              return (
                <Alert severity="warning" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>
                    Se agotaron los cupos disponibles para esta cohorte.
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    En caso de abrirse nuevos cupos se estará informando por los canales oficiales.
                  </Typography>
                </Alert>
              );
            }

            if (!detalle.formulario) {
              return (
                <Alert severity="error" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography>
                    Esta cohorte no tiene un formulario de inscripción configurado.
                  </Typography>
                </Alert>
              );
            }

            return <Formulario cohorte={detalle} />;
          })()}
        </Box>
      )}
    </Container>
  );
}
