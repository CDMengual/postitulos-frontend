"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00AEC3",
      light: "#A3D8E7",
      dark: "#007C8C",
      contrastText: "#ffffff",
    },

    text: {
      primary: "#000000",
      secondary: "#838383",
    },
    background: {
      default: "#fffffe",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontWeight: 600 },
    h2: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease-in-out",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#007C8C",
          },
        },
        containedSecondary: {
          "&:hover": {
            backgroundColor: "#3D1A5A",
          },
        },
      },
    },
  },
});

export default theme;
