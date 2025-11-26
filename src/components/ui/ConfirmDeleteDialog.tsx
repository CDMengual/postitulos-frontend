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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {title}
        <IconButton onClick={onClose} size="small">
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
        <Button onClick={onClose} variant="outlined">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
