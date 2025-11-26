"use client";
import { Box, CircularProgress } from "@mui/material";
import { useSidebar } from "@/components/providers/SidebarProvider";

const drawerWidth = 240;
const collapsedWidth = 72;

export default function LoadingOverlay() {
  const { open } = useSidebar();
  const sidebarWidth = open ? drawerWidth : collapsedWidth;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        width: `calc(100vw - ${sidebarWidth}px)`,
        height: "100vh",
        backgroundColor: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        backdropFilter: "blur(1px)",
        transition: "left 0.3s ease, width 0.3s ease",
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
}
