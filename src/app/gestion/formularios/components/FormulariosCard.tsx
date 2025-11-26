"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  CardHeader,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { Formulario } from "@/types/formulario";
import Pill from "@/components/ui/Pill";
import { useState } from "react";
import { getPostituloColor } from "@/constants/postitulosColors";

interface Props {
  data: Formulario[];
}

export default function FormulariosCard({ data }: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFormulario, setMenuFormulario] = useState<Formulario | null>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    formulario: Formulario
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuFormulario(formulario);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFormulario(null);
  };

  const handleView = () => {
    if (menuFormulario)
      router.push(`/gestion/formularios/${menuFormulario.id}`);
    handleMenuClose();
  };

  if (data.length === 0) {
    return (
      <Typography textAlign="center" color="text.secondary" mt={4}>
        No hay formularios creados aún.
      </Typography>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {data.map((f) => (
          <Card key={f.id} variant="hoverable">
            <CardHeader
              title={
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Typography className="cardTitle">{f.nombre}</Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {f.postitulo?.codigo ? (
                      <Pill
                        label={f.postitulo.codigo}
                        color={getPostituloColor(f.postitulo.codigo)}
                        variant="outlined"
                      />
                    ) : (
                      <Pill
                        label="Sin código"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Stack>
              }
              subheader={f.descripcion || "Sin descripción"}
              action={
                <IconButton onClick={(e) => handleMenuOpen(e, f)}>
                  <MoreVertIcon />
                </IconButton>
              }
            />

            <CardContent>
              <Chip
                label={`${f.campos.length} campos`}
                color="default"
                size="small"
              />
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
            console.log("Eliminar", menuFormulario?.id);
            handleMenuClose();
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          Eliminar
        </MenuItem>
      </Menu>
    </>
  );
}
