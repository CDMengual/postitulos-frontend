"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    hoverable: true;
  }
}

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
    allVariants: {
      color: "#333333",
    },
    h1: { fontWeight: 600 },
    h2: { fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    // 🔹 Botones
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

    // 🔹 Dialogs
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: 8,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "1.1rem",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "16px 24px 8px 24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px 24px 24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
        },
      },
    },

    // 🔹 Inputs / Selects / Labels
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
        }),
        input: {
          "&::placeholder": {
            color: "#9e9e9e",
            opacity: 1,
            fontSize: "0.9rem",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        noOptions: {
          fontSize: "0.9rem",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 8,
        },
        icon: {
          color: "#555",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "0.9rem",
          color: "#666",
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
        }),
      },
    },

    // 🔹 DataGrid
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "1px solid #e0e0e0",
        },
        cell: {
          "&:focus, &:focus-within": {
            outline: "none !important",
          },
        },
        columnHeader: {
          "&:focus, &:focus-within": {
            outline: "none !important",
          },
        },
      },
    } as never,

    // 🔹 Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e5e5",
          padding: 4,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        },
      },
      variants: [
        {
          props: { variant: "hoverable" },
          style: {
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 6px 14px rgba(0, 0, 0, 0.1)",
            },
          },
        },
      ],
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          paddingBottom: 0,
          marginBottom: "1rem",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddingBottom: 16,
        },
      },
    },
  },
});

export default theme;
