"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/providers/UserProvider";
import api from "@/services/api";

export default function Navbar() {
  const { user, setUser } = useUserContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestión — Postítulos DPES
        </Typography>
        <Box component="span">{user?.nombre}</Box>
        <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
