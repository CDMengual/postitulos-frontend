"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import ToastProvider from "@/components/providers/ToastProvider";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export default function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
