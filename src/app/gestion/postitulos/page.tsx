"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import { getPostituloTypeMeta } from "@/constants/pillColor";
import { Postitulo, PostituloFormDialog, usePostitulos } from "@/features/postitulos";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import ConfirmDeleteDialog from "@/shared/components/ui/ConfirmDeleteDialog";
import Pill from "@/shared/components/ui/Pill";
import { appToast } from "@/shared/lib/toast";

export default function PostitulosPage() {
  const router = useRouter();
  const { user } = useUserContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPostitulo, setMenuPostitulo] = useState<Postitulo | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedPostitulo, setSelectedPostitulo] = useState<Postitulo | null>(null);
  const { postitulos, refresh, removePostitulo } = usePostitulos();
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postitulo: Postitulo) => {
    setAnchorEl(event.currentTarget);
    setMenuPostitulo(postitulo);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPostitulo(null);
  };

  const handleView = () => {
    if (menuPostitulo) {
      router.push(`/gestion/postitulos/${menuPostitulo.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = (postitulo: Postitulo) => {
    setSelectedPostitulo(postitulo);
    setOpenConfirm(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedPostitulo) return;

    try {
      await removePostitulo(selectedPostitulo.id);
      appToast.success("Postitulo eliminado correctamente");
    } catch {
      appToast.error();
    } finally {
      setOpenConfirm(false);
      setSelectedPostitulo(null);
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Postitulos
        </Typography>
        {user?.rol === "ADMIN" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPostitulo(null);
              setOpenForm(true);
            }}
          >
            Nuevo postitulo
          </Button>
        )}
      </Stack>

      <Stack spacing={3}>
        {postitulos.map((postitulo) => (
          <Card key={postitulo.id} variant="hoverable">
            <CardHeader
              title={
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Typography className="cardTitle">{postitulo.nombre}</Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {postitulo.tipos?.length > 0 ? (
                      postitulo.tipos.map((tipo) => (
                        <Pill
                          key={tipo.id}
                          label={getPostituloTypeMeta(tipo.tipo).label}
                          color={getPostituloTypeMeta(tipo.tipo).color}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Pill label="Sin tipo" color="default" variant="outlined" />
                    )}
                  </Stack>
                </Stack>
              }
              subheader={postitulo.resolucion || "Sin resolucion"}
              action={
                <IconButton onClick={(event) => handleMenuOpen(event, postitulo)}>
                  <MoreVertIcon />
                </IconButton>
              }
            />

            <CardContent>
              <Typography>
                <strong>Coordinadores:</strong> {postitulo.coordinadores || "-"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose} PaperProps={{ sx: { width: 180 } }}>
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
            if (!menuPostitulo) return;
            handleDelete(menuPostitulo);
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          Eliminar
        </MenuItem>
      </Menu>

      <ConfirmDeleteDialog
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false);
          setSelectedPostitulo(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminacion"
        message="Estas seguro de que queres eliminar el postitulo"
        highlightText={selectedPostitulo?.nombre}
        confirmLabel="Eliminar"
        confirmColor="error"
      />

      <PostituloFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={() => {
          setOpenForm(false);
          void refresh();
        }}
        postitulo={selectedPostitulo}
      />
    </Box>
  );
}
