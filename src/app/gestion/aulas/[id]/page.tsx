"use client";

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
import { useUserContext } from "@/shared/components/providers/UserProvider";
import BackButton from "@/shared/components/ui/BackButton";
import Pill from "@/shared/components/ui/Pill";
import { getEstadoCohorteMeta } from "@/constants/pillColor";
import { AulaCursanteAddDialog, AulaCursantesTable, useAulaDetail } from "@/features/aulas";
import { useState } from "react";

export default function AulaDetailPage() {
  const { id } = useParams();
  const { user } = useUserContext();
  const aulaId = Number(id);
  const [openAdd, setOpenAdd] = useState(false);
  const { aula, loading, refresh } = useAulaDetail(aulaId);

  if (loading && !aula) return null;
  if (!aula) return null;

  const estadoMeta = getEstadoCohorteMeta(aula.cohorte?.estado);

  return (
    <>
      <BackButton backUrl="/gestion/aulas" />
      <Box p={3}>
        <Card variant="hoverable">
          <CardHeader
            title={
              <Stack direction="row" justifyContent="space-between" alignItems="start">
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
              <strong>Postitulo:</strong> {aula.cohorte?.postitulo?.nombre || "-"}
            </Typography>
            <Typography>
              <strong>Cohorte:</strong> {aula.cohorte?.nombre || "-"}
            </Typography>
            <Typography>
              <strong>Instituto:</strong> {aula.instituto?.nombre || "No asignado"}
            </Typography>
            <Typography>
              <strong>Referente(s):</strong>{" "}
              {aula.referentes?.length
                ? aula.referentes.map((referente) => `${referente.nombre} ${referente.apellido}`).join(", ")
                : "-"}
            </Typography>
          </CardContent>
        </Card>

        {user?.rol === "ADMIN" && (
          <Stack direction="row" justifyContent="flex-end" mt={2}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>
              Inscribir cursantes
            </Button>
          </Stack>
        )}

        <Box mt={2}>
          <AulaCursantesTable
            data={aula.cursantes}
            aulaId={aulaId}
            aulaNombre={aula.nombre}
            onDeleted={() => void refresh()}
          />
        </Box>

        <AulaCursanteAddDialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          aulaId={aulaId}
          onCreated={() => void refresh()}
        />
      </Box>
    </>
  );
}
