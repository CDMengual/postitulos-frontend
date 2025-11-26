import type { Components, Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: React.CSSProperties;
        cell?: React.CSSProperties;
        columnHeader?: React.CSSProperties;
      };
    };
  }
}
