"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface BackButtonProps extends ButtonProps {
  backUrl?: string;
  fallbackUrl?: string;
  label?: string;
}

export default function BackButton({
  backUrl,
  fallbackUrl = "/",
  label = "Volver",
  ...props
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (backUrl) {
      router.push(backUrl);
      return;
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button onClick={handleClick} startIcon={<ArrowBackIcon />} {...props}>
      {label}
    </Button>
  );
}
