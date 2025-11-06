"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "@/services/api";
import { Postitulo } from "@/types/postitulo";
import styles from "./Postitulos.module.css";
import Pill from "@/components/ui/Pill";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Postitulo[];
  meta: { total: number };
}

export default function PostitulosPage() {
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostitulo, setMenuPostitulo] = useState<Postitulo | null>(null);
  const openMenu = Boolean(anchorEl);

  const getPostitulos = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse>("/postitulos");
      setPostitulos(res.data.data);
    } catch (error) {
      console.error("Error getting postitulos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPostitulos();
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    postitulo: Postitulo
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuPostitulo(postitulo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPostitulo(null);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ESPECIALIZACION":
        return "info";
      case "DIPLOMATURA":
        return "secondary";
      case "ACTUALIZACION":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          Postítulos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo Postítulo
        </Button>
      </Stack>

      {loading ? (
        <Stack alignItems="center" mt={5}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack spacing={3}>
          {postitulos.map((p) => (
            <Card key={p.id} className={styles.card}>
              <CardHeader
                title={
                  <div className={styles.cardHeader}>
                    <Typography className={styles.cardTitle}>
                      {p.nombre}
                    </Typography>
                    <Pill
                      label={p.tipo.toLowerCase()}
                      color={getTipoColor(p.tipo)}
                      variant="filled"
                    />
                  </div>
                }
                subheader={` ${p.resolucion || "Sin resolución"}`}
                action={
                  <IconButton onClick={(e) => handleMenuOpen(e, p)}>
                    <MoreVertIcon />
                  </IconButton>
                }
              />
              <CardContent className={styles.cardContent}>
                <Typography className={styles.cardLine}>
                  <strong>Título:</strong> {p.titulo || "-"}
                </Typography>
                <Typography className={styles.cardLine}>
                  <strong>Coordinadores:</strong> {p.coordinadores || "-"}
                </Typography>
                <Typography className={styles.cardLine}>
                  <strong>Resolución:</strong> {p.resolucion || "-"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 180 } }}
      >
        <MenuItem
          onClick={() => {
            console.log("Ver detalle", menuPostitulo?.id);
            handleMenuClose();
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalle
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Editar", menuPostitulo?.id);
            handleMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Eliminar", menuPostitulo?.id);
            handleMenuClose();
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
}
