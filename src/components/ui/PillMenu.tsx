"use client";

import { useState } from "react";
import { Menu, MenuItem, CircularProgress } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import Pill from "./Pill";

interface Option {
  label: string;
  value: string;
  color: string;
}

interface PillMenuProps {
  value: string;
  options: Option[];
  onChange: (newValue: string) => Promise<void> | void;
  filled?: boolean;
}

export default function PillMenu({
  value,
  options,
  onChange,
  filled,
}: PillMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const current = options.find((o) => o.value === value) || options[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!loading) setAnchorEl(event.currentTarget);
  };

  const handleSelect = async (val: string) => {
    setAnchorEl(null);
    if (val === value) return;
    setLoading(true);

    // Timeout para testing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await onChange(val);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pill
        label={
          loading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            current.label
          )
        }
        color={current.color}
        variant={filled ? "filled" : "outlined"}
        onClick={handleClick}
        deleteIcon={loading ? undefined : <ArrowDropDown />}
        onDelete={!loading ? handleClick : undefined}
        sx={{
          cursor: loading ? "default" : "pointer",
          "& .MuiChip-deleteIcon": {
            color: filled ? "#fff" : current.color,
          },
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            selected={opt.value === value}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
