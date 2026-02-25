"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/providers/UserProvider";
import api from "@/services/api";
import PersonIcon from "@mui/icons-material/Person";

export default function Navbar() {
  const { user, setUser } = useUserContext();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await api.post("/auth/logout");
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const initials =
    user?.nombre && user?.apellido
      ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
      : "";

  return (
    <AppBar
      position="static"
      color="primary"
      elevation={0}
      sx={{
        zIndex: 20,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, color: "primary.contrastText" }}
        >
          Gestión — Postítulos DPES
        </Typography>

        {/* Menú de usuario */}
        <Box>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{ bgcolor: "primary.contrastText", color: "primary.main" }}
            >
              {initials || <PersonIcon fontSize="small" />}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 180,
                boxShadow: 3,
              },
            }}
          >
            {/* Encabezado con nombre y rol */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.rol}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={() => router.push("/gestion/perfil")}>Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

