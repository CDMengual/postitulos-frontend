"use client";

import { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Container,
  Alert,
} from "@mui/material";
import api from "@/services/api";
import { CohortePublica } from "@/types/cohorte";
import Formulario from "@/components/formularios/Fromulario";
import { formatDate } from "@/utils/date";

export default function InscripcionPublicaPage() {
  const [cohortes, setCohortes] = useState<CohortePublica[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detalle, setDetalle] = useState<CohortePublica | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // 🔹 Cargar cohortes disponibles
  useEffect(() => {
    const fetchCohortes = async () => {
      try {
        const res = await api.get("/public/cohortes-en-inscripcion");
        setCohortes(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCohortes();
  }, []);

  // 🔹 Al seleccionar cohorte
  const handleSelect = async (id: string) => {
    setSelected(id);
    setLoadingDetalle(true);
    setDetalle(null);

    try {
      const res = await api.get(`/public/cohortes/${id}`);
      setDetalle(res.data.data);
    } catch (error) {
      console.error("Error obteniendo cohorte pública:", error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // 🔹 Lógica de fechas con estados
  const getEstadoInscripcion = (cohorte: CohortePublica) => {
    const inicio = cohorte.fechaInicioInscripcion
      ? new Date(cohorte.fechaInicioInscripcion)
      : null;
    const fin = cohorte.fechaFinInscripcion
      ? new Date(cohorte.fechaFinInscripcion)
      : null;
    const hoy = new Date();

    if (!inicio || !fin) return "invalid";

    if (hoy < inicio) return "not-started";
    if (hoy > fin) return "finished";
    return "active";
  };

  return (
    <Container maxWidth="md" sx={{ mb: 6 }}>
      {/* Banner */}
      <Stack alignItems="center" spacing={2} mt={6} mb={4}>
        <Box
          component="img"
          src="/assets/logos/banner_pba.svg"
          alt="Logo PBA"
          sx={{ height: 100 }}
        />
      </Stack>

      {/* Selector */}
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
                {c.postitulo?.nombre} — Cohorte {c.anio}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {/* Loading */}
      {loadingDetalle && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Detalle */}
      {detalle && (
        <Box mt={4}>
          {(() => {
            const estado = getEstadoInscripcion(detalle);

            const inicio = detalle.fechaInicioInscripcion
              ? formatDate(detalle.fechaInicioInscripcion, "long")
              : "";
            const fin = detalle.fechaFinInscripcion
              ? formatDate(detalle.fechaFinInscripcion, "long")
              : "";

            if (estado === "not-started") {
              return (
                <Alert severity="info" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>
                    La inscripción no se encuentra abierta.
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    Período habilitado: <strong>{inicio}</strong> al{" "}
                    <strong>{fin}</strong>.
                  </Typography>
                </Alert>
              );
            }

            if (estado === "finished") {
              return (
                <Alert severity="warning" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={600}>
                    La inscripción ya finalizó.
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    Período: <strong>{inicio}</strong> al <strong>{fin}</strong>
                    .
                  </Typography>
                </Alert>
              );
            }

            if (estado === "invalid") {
              return (
                <Alert severity="error" sx={{ borderRadius: 2, p: 2 }}>
                  <Typography>
                    No se encontraron fechas de inscripción válidas.
                  </Typography>
                </Alert>
              );
            }

            // 🔹 Si está activa → mostrar formulario
            return <Formulario cohorte={detalle} />;
          })()}
        </Box>
      )}
    </Container>
  );
}
