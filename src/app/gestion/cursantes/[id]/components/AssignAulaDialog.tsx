"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { Aula } from "@/types/aula";

interface Props {
  open: boolean;
  aulas: Aula[];
  assignedAulaCodes: string[];
  loadingAulas: boolean;
  onClose: () => void;
  onAssign: (aulaId: number) => Promise<void>;
}

export default function AssignAulaDialog({
  open,
  aulas,
  assignedAulaCodes,
  loadingAulas,
  onClose,
  onAssign,
}: Props) {
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [assigning, setAssigning] = useState(false);

  const normalizeCode = (value: string) => value.trim().toUpperCase();

  const assignedCodesSet = useMemo(
    () => new Set(assignedAulaCodes.map((code) => normalizeCode(code))),
    [assignedAulaCodes]
  );

  const availableAulas = useMemo(
    () => aulas.filter((aula) => !assignedCodesSet.has(normalizeCode(aula.codigo))),
    [aulas, assignedCodesSet]
  );

  useEffect(() => {
    if (!open) {
      setSelectedAula(null);
      setAssigning(false);
    }
  }, [open]);

  const handleClose = () => {
    if (assigning) return;
    onClose();
  };

  const handleAssign = async () => {
    if (!selectedAula) return;
    try {
      setAssigning(true);
      await onAssign(selectedAula.id);
      onClose();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Asignar aula</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Autocomplete
            options={availableAulas}
            loading={loadingAulas}
            value={selectedAula}
            onChange={(_, value) => setSelectedAula(value)}
            getOptionLabel={(option) => `${option.codigo} - ${option.cohorte.postitulo.nombre}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={
              loadingAulas ? "Cargando aulas..." : "No hay aulas disponibles para asignar"
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Aula"
                placeholder="Buscar por código o nombre"
                required
                helperText={
                  availableAulas.length === 0
                    ? "No hay aulas disponibles para asignar"
                    : "Seleccioná el aula a asignar"
                }
              />
            )}
            disabled={loadingAulas || assigning}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={assigning}>
          Cancelar
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedAula || assigning || loadingAulas || availableAulas.length === 0}
        >
          {assigning ? <CircularProgress size={16} color="inherit" /> : "Asignar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
