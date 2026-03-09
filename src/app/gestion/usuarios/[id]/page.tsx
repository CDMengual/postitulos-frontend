"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BackButton from "@/shared/components/ui/BackButton";
import Pill from "@/shared/components/ui/Pill";
import { getRolMeta } from "@/constants/pillColor";
import { getUsuario } from "@/features/usuarios/api";
import { User } from "@/features/usuarios/model/types";

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== "string") return;

    const loadUsuario = async () => {
      try {
        setLoading(true);
        const nextUser = await getUsuario(id);
        setUser(nextUser);
      } catch (err) {
        console.error("Error al obtener usuario:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadUsuario();
  }, [id]);

  if (loading) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) return null;

  const rolMeta = getRolMeta(user.rol);

  return (
    <>
      <BackButton backUrl="/gestion/usuarios" />
      <Box px={3} py={2}>
        <Card variant="hoverable">
          <CardHeader
            title={
              <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Typography className="cardTitle">
                  {user.nombre} {user.apellido}
                </Typography>
                <Pill label={rolMeta.label} color={rolMeta.color} />
              </Stack>
            }
            subheader={`DNI: ${user.dni}`}
          />

          <CardContent>
            <Stack spacing={1}>
              <Typography>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography>
                <strong>Celular:</strong> {user.celular || "-"}
              </Typography>
              <Typography>
                <strong>Creado:</strong> {new Date(user.createdAt).toLocaleDateString("es-AR")}
              </Typography>
              <Typography>
                <strong>Actualizado:</strong> {new Date(user.updatedAt).toLocaleDateString("es-AR")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {user.instituto ? (
          <Card sx={{ mt: 4 }}>
            <CardHeader title={<Typography className="cardTitle">Instituto</Typography>} />
            <Divider />
            <CardContent sx={{ mt: 2 }}>
              <Stack spacing={1}>
                <Typography>
                  <strong>Nombre:</strong> {user.instituto.nombre}
                </Typography>
                <Typography>
                  <strong>Distrito:</strong> {user.instituto.distrito?.nombre || "-"}
                </Typography>
                <Typography>
                  <strong>RegiÃ³n:</strong> {user.instituto.distrito?.region?.id || "-"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </>
  );
}
