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
import BackButton from "@/components/ui/BackButton";
import api from "@/services/api";
import Pill from "@/components/ui/Pill";
import { getRolMeta } from "@/constants/pillColor";

interface Instituto {
  id: number;
  nombre: string;
  distrito?: {
    id: number;
    nombre: string;
    region?: { id: number };
  } | null;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  rol: string;
  institutoId: number | null;
  createdAt: string;
  updatedAt: string;
  instituto: Instituto | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Usuario;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const getUsuario = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse>(`/users/${id}`);
      setUser(res.data.data);
    } catch (err) {
      console.error("Error al obtener usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getUsuario();
  }, [id]);

  if (loading)
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );

  if (!user) return null;

  const rolMeta = getRolMeta(user.rol);

  return (
    <>
      <BackButton backUrl="/gestion/usuarios" />
      <Box px={3} py={2}>
        {/* 🧍 Información general */}
        <Card variant="hoverable">
          <CardHeader
            title={
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="start"
              >
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
                <strong>Creado:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("es-AR")}
              </Typography>
              <Typography>
                <strong>Actualizado:</strong>{" "}
                {new Date(user.updatedAt).toLocaleDateString("es-AR")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* 🏫 Instituto (solo si tiene) */}
        {user.instituto && (
          <Card sx={{ mt: 4 }}>
            <CardHeader
              title={<Typography className="cardTitle">Instituto</Typography>}
            />
            <Divider />
            <CardContent sx={{ mt: 2 }}>
              <Stack spacing={1}>
                <Typography>
                  <strong>Nombre:</strong> {user.instituto.nombre}
                </Typography>
                <Typography>
                  <strong>Distrito:</strong>{" "}
                  {user.instituto.distrito?.nombre || "-"}
                </Typography>
                <Typography>
                  <strong>Región:</strong>{" "}
                  {user.instituto.distrito?.region?.id || "-"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
}
