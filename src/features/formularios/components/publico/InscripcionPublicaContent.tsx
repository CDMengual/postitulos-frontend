"use client";

import { Alert, Box, Container, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import Formulario from "./Formulario";
import { useCohortesEnInscripcion } from "@/features/formularios/hooks/useCohortesEnInscripcion";
import { formatDate } from "@/shared/lib/date";

export default function InscripcionPublicaContent() {
  const { cohortes, selectedId, selectedCohorte, loading, error, setSelectedId } =
    useCohortesEnInscripcion();

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

          <Select
            fullWidth
            value={selectedId}
            displayEmpty
            onChange={(event) => setSelectedId(event.target.value as string)}
            disabled={loading}
          >
            <MenuItem value="" disabled>
              {loading ? "Cargando cohortes..." : "Elige una cohorte"}
            </MenuItem>

            {cohortes.map((cohorte) => (
              <MenuItem value={String(cohorte.id)} key={cohorte.id}>
                {cohorte.postitulo.nombre} - Cohorte {cohorte.anio}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {selectedCohorte ? (
        <Box mt={4}>
          {(() => {
            const inicio = selectedCohorte.fechaInicioInscripcion
              ? formatDate(selectedCohorte.fechaInicioInscripcion, "long", {
                  timeZone: "UTC",
                })
              : "";
            const fin = selectedCohorte.fechaFinInscripcion
              ? formatDate(selectedCohorte.fechaFinInscripcion, "long", {
                  timeZone: "UTC",
                })
              : "";

            if (
              selectedCohorte.fueraDePeriodoInscripcion ||
              !selectedCohorte.enPeriodoInscripcion
            ) {
              return (
                <Alert severity="info" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>La inscripcion no se encuentra abierta.</Typography>
                  <Typography variant="body2" mt={0.5}>
                    Periodo habilitado: <strong>{inicio}</strong> al <strong>{fin}</strong>.
                  </Typography>
                </Alert>
              );
            }

            if (selectedCohorte.sinCuposDisponibles || !selectedCohorte.tieneCuposDisponibles) {
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

            if (!selectedCohorte.formulario) {
              return (
                <Alert severity="error" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography>
                    Esta cohorte no tiene un formulario de inscripcion configurado.
                  </Typography>
                </Alert>
              );
            }

            return <Formulario cohorte={selectedCohorte} />;
          })()}
        </Box>
      ) : null}
    </Container>
  );
}
