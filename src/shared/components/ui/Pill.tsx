"use client";
import { Chip, ChipProps } from "@mui/material";

interface PillProps extends Omit<ChipProps, "color"> {
  color?: ChipProps["color"] | string;
}

export default function Pill({ color, sx, ...props }: PillProps) {
  const isCustomColor =
    typeof color === "string" &&
    (color.startsWith("#") || color.startsWith("rgb"));

  return (
    <Chip
      variant={props.variant || "outlined"}
      size={props.size || "small"}
      sx={{
        borderRadius: "999px",
        fontWeight: 600,
        textTransform: "capitalize",
        px: 1.5,
        ...(isCustomColor && {
          borderColor: color,
          color: props.variant === "filled" ? "#fff" : color,
          backgroundColor: props.variant === "filled" ? color : "transparent",
        }),
        ...sx,
      }}
      color={isCustomColor ? undefined : (color as ChipProps["color"])}
      {...props}
    />
  );
}
