"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import api from "@/services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  aulaId: number;
  onImported: () => void;
}

export default function CursantesUploadDialog({
  open,
  onClose,
  aulaId,
  onImported,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setSuccessMsg("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/aulas/${aulaId}/cursantes/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Archivo procesado y guardado correctamente");
      onImported();
    } catch (err) {
      console.error("Error subiendo cursantes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cargar lista de cursantes</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Button variant="outlined" component="label">
            Seleccionar archivo (.xlsx / .csv)
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>

          {fileName && (
            <Typography variant="body2" color="text.secondary">
              Archivo seleccionado: <strong>{fileName}</strong>
            </Typography>
          )}

          {successMsg && <Alert severity="success">{successMsg}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || loading}
        >
          {loading ? "Subiendo..." : "Subir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
