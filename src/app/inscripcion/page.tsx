"use client";

import { useEffect, useState } from "react";
import { Select, MenuItem, Box, Typography, Paper, Stack, Container, Alert } from "@mui/material";
import { CohortePublica } from "@/features/cohortes/model/types";
import Formulario from "@/features/formularios/components/publico/Formulario";
import { listCohortesEnInscripcion } from "@/features/formularios/api";
import { formatDate } from "@/shared/lib/date";

export default function InscripcionPublicaPage() {
  const [cohortes, setCohortes] = useState<CohortePublica[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detalle, setDetalle] = useState<CohortePublica | null>(null);

  useEffect(() => {
    const fetchCohortes = async () => {
      try {
        const nextCohortes = await listCohortesEnInscripcion();
        setCohortes(nextCohortes);
      } catch (error) {
        console.error(error);
      }
    };
    void fetchCohortes();
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    const cohorteSeleccionada = cohortes.find((cohorte) => String(cohorte.id) === id) ?? null;
    setDetalle(cohorteSeleccionada);
  };

  return (
    <Container maxWidth="md" sx={{ mb: 6 }}>
      <Stack alignItems="center" spacing={2} mt={6} mb={4}>
        <Box component="img" src="/assets/logos/banner_pba.svg" alt="Logo PBA" sx={{ height: 100 }} />
      </Stack>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Inscripcion a Postitulos
        </Typography>

        <Box mt={3}>
          <Typography variant="body1" mb={1}>
            Selecciona el postitulo:
          </Typography>

          <Select fullWidth value={selected} displayEmpty onChange={(e) => handleSelect(e.target.value as string)}>
            <MenuItem value="" disabled>
              Elige una cohorte
            </MenuItem>

            {cohortes.map((cohorte) => (
              <MenuItem value={String(cohorte.id)} key={cohorte.id}>
                {cohorte.postitulo.nombre} - Cohorte {cohorte.anio}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {detalle ? (
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

            if (detalle.fueraDePeriodoInscripcion || !detalle.enPeriodoInscripcion) {
              return (
                <Alert severity="info" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>La inscripcion no se encuentra abierta.</Typography>
                  <Typography variant="body2" mt={0.5}>
                    Periodo habilitado: <strong>{inicio}</strong> al <strong>{fin}</strong>.
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
                    En caso de abrirse nuevos cupos se estara informando por los canales oficiales.
                  </Typography>
                </Alert>
              );
            }

            if (!detalle.formulario) {
              return (
                <Alert severity="error" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography>
                    Esta cohorte no tiene un formulario de inscripcion configurado.
                  </Typography>
                </Alert>
              );
            }

            return <Formulario cohorte={detalle} />;
          })()}
        </Box>
      ) : null}
    </Container>
  );
}
