"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "@/services/api";
import { Aula } from "@/types/aula";
import styles from "../aulas.module.css";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import CursantesTable from "./components/CursantesTable";
import Pill from "@/components/ui/Pill";
import { getPostituloTypeMeta } from "@/constants/postituloTypes";
import CursantesUploadDialog from "./components/CursantesUploadDialog";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Aula;
}

export default function AulaDetailPage() {
  const { id } = useParams();
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openUpload, setOpenUpload] = useState(false); // ✅ nuevo estado para el modal

  // 🔹 Obtener datos del aula
  const getAula = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse>(`/aulas/${id}`);
      setAula(res.data.data);
    } catch (err) {
      console.error("Error al obtener aula:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getAula();
  }, [id]);

  // 🔹 Abrir modal de carga
  const handleUploadCursantes = () => {
    setOpenUpload(true);
  };

  // 🔹 Callback cuando se cargaron cursantes correctamente
  const handleImported = () => {
    getAula(); // vuelve a traer los datos actualizados
  };

  if (loading)
    return (
      <Stack alignItems="center" mt={5}>
        <CircularProgress />
      </Stack>
    );

  if (!aula)
    return (
      <Typography color="text.secondary" mt={3}>
        Aula no encontrada
      </Typography>
    );

  return (
    <Box p={3}>
      {/* 🔹 Card de información general */}
      <Card className={styles.card}>
        <CardHeader
          title={
            <div className={styles.cardHeader}>
              <Typography variant="h6" fontWeight={600}>
                {aula.nombre}
              </Typography>
              <Box style={{ marginTop: "2px" }}>
                <Pill
                  label={getPostituloTypeMeta(aula.postitulo?.tipo).label}
                  color={getPostituloTypeMeta(aula.postitulo?.tipo).color}
                  variant="outlined"
                />
              </Box>
            </div>
          }
          subheader={`Cohorte ${aula.cohorte} — ${aula.postitulo?.nombre}`}
        />
        <CardContent className={styles.cardContent}>
          <Stack>
            <Typography className={styles.cardLine}>
              <strong>Código:</strong> {aula.codigo}
            </Typography>
            <Typography className={styles.cardLine}>
              <strong>Referente(s):</strong>{" "}
              {aula.referentes
                ?.map((r) => `${r.nombre} ${r.apellido}`)
                .join(", ") || "-"}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* 🔹 Tabla de cursantes */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Cursantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleUploadCursantes}
        >
          {aula.cursantesData?.length ? "Agregar Cursantes" : "Cargar lista"}
        </Button>
      </Stack>

      {aula.cursantesData && aula.cursantesData.length > 0 ? (
        <CursantesTable data={aula.cursantesData} />
      ) : (
        <Typography color="text.secondary" mt={2}>
          No hay cursantes cargados.
        </Typography>
      )}

      {/* 🔹 Modal de carga de cursantes */}
      <CursantesUploadDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        aulaId={Number(id)}
        onImported={handleImported}
      />

      {/* 🔹 Modal de confirmación (si lo necesitás para eliminar) */}
      <ConfirmDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => console.log("Confirmado")}
        title="Eliminar aula"
        message="¿Seguro que querés eliminar el aula"
        highlightText={aula.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
}
