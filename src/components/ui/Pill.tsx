"use client";
import { Chip, ChipProps } from "@mui/material";

export default function Pill(props: ChipProps) {
  return (
    <Chip
      variant={props.variant || "outlined"}
      size={props.size || "small"}
      sx={{
        borderRadius: "999px",
        fontWeight: 600,
        textTransform: "capitalize",
        padding: "0.5rem",
        ...props.sx,
      }}
      {...props}
    />
  );
}
