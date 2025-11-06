"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import UserProvider, {
  useUserContext,
} from "@/components/providers/UserProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { loading } = useUserContext();

  if (loading) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Navbar />
        {/* separador para que el contenido no quede debajo del AppBar */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // UserProvider trae /user y expone role para Sidebar
  return (
    <UserProvider>
      <Shell>{children}</Shell>
    </UserProvider>
  );
}
