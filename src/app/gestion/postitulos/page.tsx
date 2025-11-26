"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "@/services/api";
import { Postitulo } from "@/types/postitulo";
import { getPostituloTypeMeta } from "@/constants/pillColor";
import Pill from "@/components/ui/Pill";
import PostituloFormDialog from "./components/PostituloFormDialog";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Postitulo[];
  meta: { total: number };
}

export default function PostitulosPage() {
  const router = useRouter();
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostitulo, setMenuPostitulo] = useState<Postitulo | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedPostitulo, setSelectedPostitulo] = useState<Postitulo | null>(
    null
  );
  const openMenu = Boolean(anchorEl);

  const getPostitulos = async () => {
    try {
      const res = await api.get<ApiResponse>("/postitulos");
      setPostitulos(res.data.data);
    } catch (error) {
      console.error("Error getting postitulos:", error);
    } finally {
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

  const handleView = () => {
    if (menuPostitulo) router.push(`/gestion/postitulos/${menuPostitulo.id}`);
    handleMenuClose();
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedPostitulo(null);
            setOpenForm(true);
          }}
        >
          Nuevo Postítulo
        </Button>
      </Stack>

      <Stack spacing={3}>
        {postitulos.map((p) => (
          <Card key={p.id} variant="hoverable">
            <CardHeader
              title={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Typography className="cardTitle">{p.nombre}</Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {p.tipos?.length > 0 ? (
                      p.tipos.map((t) => (
                        <Pill
                          key={t.id}
                          label={getPostituloTypeMeta(t.tipo).label}
                          color={getPostituloTypeMeta(t.tipo).color}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Pill
                        label="Sin tipo"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>
              }
              subheader={p.resolucion || "Sin resolución"}
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, p)}>
                  <MoreVertIcon />
                </IconButton>
              }
            />

            <CardContent>
              <Typography>
                <strong>Coordinadores:</strong> {p.coordinadores || "-"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { width: 180 } }}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalle
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSelectedPostitulo(menuPostitulo);
            setOpenForm(true);
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
      <PostituloFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={getPostitulos}
        postitulo={selectedPostitulo}
      />
    </Box>
  );
}
