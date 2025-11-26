"use client";

import { Box, CircularProgress, Stack } from "@mui/material";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import RouteLoadingListener from "@/components/providers/RouteLoadingListener";
import {
  useLoading,
  LoadingProvider,
} from "@/components/providers/LoadingProvider";
import UserProvider, {
  useUserContext,
} from "@/components/providers/UserProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

function Shell({ children }: { children: React.ReactNode }) {
  const { loading: userLoading } = useUserContext();
  const { loading } = useLoading();

  if (userLoading) {
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

        <Box
          component="main"
          sx={{ flex: 1, p: 3, overflow: "auto", position: "relative" }}
        >
          {children}
          {loading && <LoadingOverlay />}
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
  return (
    <LoadingProvider>
      <UserProvider>
        <SidebarProvider>
          <Shell>
            <RouteLoadingListener />
            {children}
          </Shell>
        </SidebarProvider>
      </UserProvider>
    </LoadingProvider>
  );
}
