"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "warning" | "info" | "success";
  highlightText?: string;
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmColor = "error",
  highlightText,
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setLoading(false);
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await Promise.resolve(onConfirm());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {title}
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack alignItems="center" spacing={2} textAlign="center">
          <Typography variant="body1">
            {message}{" "}
            {highlightText && (
              <Typography component="span" fontWeight={600}>
                {highlightText}
              </Typography>
            )}
            ?
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {loading ? <CircularProgress color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
