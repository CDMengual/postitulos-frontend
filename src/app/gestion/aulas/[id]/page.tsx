"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "@/services/api";
import BackButton from "@/components/ui/BackButton";
import { Aula } from "@/types/aula";
import ConfirmDialog from "@/components/ui/ConfirmDeleteDialog";
import CursantesTable from "./components/CursantesTable";
import CursanteAddDialog from "./components/CursanteAddDialog";
import Pill from "@/components/ui/Pill";
import { getEstadoCohorteMeta } from "@/constants/pillColor";

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
  const [openAdd, setOpenAdd] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!aula) return null;

  const estadoMeta = getEstadoCohorteMeta(aula.cohorte?.estado);

  return (
    <>
      <BackButton backUrl="/gestion/aulas" />
      <Box p={3}>
        {/* 🔹 Información general */}
        <Card variant="hoverable">
          <CardHeader
            title={
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="start"
              >
                <Typography className="cardTitle">{aula.codigo}</Typography>
                <Pill label={estadoMeta.label} color={estadoMeta.color} />
              </Stack>
            }
            subheader={
              <>
                <Typography variant="body2" color="text.secondary">
                  {aula.cohorte?.postitulo?.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cohorte: {aula.cohorte?.nombre}
                </Typography>
              </>
            }
          />
          <CardContent>
            <Typography>
              <strong>Instituto:</strong>{" "}
              {aula.instituto?.nombre || "No asignado"}
            </Typography>
            <Typography>
              <strong>Referente(s):</strong>{" "}
              {aula.referentes?.length
                ? aula.referentes
                    .map((r) => `${r.nombre} ${r.apellido}`)
                    .join(", ")
                : "-"}
            </Typography>
          </CardContent>
        </Card>

        {/* 🔹 Acciones */}
        <Stack direction="row" justifyContent="flex-end" mt={2} mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
          >
            Inscribir cursantes
          </Button>
        </Stack>

        {/* 🔹 Tabla de cursantes */}
        <CursantesTable
          data={aula.cursantes}
          aulaId={Number(id)}
          onDeleted={getAula}
        />

        {/* 🔹 Modal unificado */}
        <CursanteAddDialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          aulaId={Number(id)}
          onCreated={getAula}
        />

        <ConfirmDialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          onConfirm={() => console.log("Confirmado")}
          title="Eliminar aula"
          message="¿Seguro que querés eliminar el aula"
          highlightText={aula.codigo}
          confirmLabel="Eliminar"
          confirmColor="error"
        />
      </Box>
    </>
  );
}
