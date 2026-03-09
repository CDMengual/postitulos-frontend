"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Autocomplete,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Paper,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { SyntheticEvent, useEffect, useState } from "react";
import { createAula, createAulasMassive, getAulaFormDependencies } from "@/features/aulas/api";
import { AulaFormData, AulaMassiveFormData } from "@/features/aulas/model/types";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import { User } from "@/features/usuarios/model/types";
import { Cohorte } from "@/features/cohortes/model/types";
import { appToast } from "@/shared/lib/toast";

type TabValue = "individual" | "masivo";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AulaFormDialog({ open, onClose, onSaved }: Props) {
  const { user } = useUserContext();
  const [tab, setTab] = useState<TabValue>("individual");
  const [loading, setLoading] = useState(false);
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [referentes, setReferentes] = useState<User[]>([]);
  const [form, setForm] = useState<AulaFormData>({ cohorteId: "", referenteId: "" });
  const [massive, setMassive] = useState<AulaMassiveFormData>({
    cohorteId: "",
    total: 1,
    distribucion: [],
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadDependencies = async () => {
      const data = await getAulaFormDependencies();
      setCohortes(data.cohortes);
      setReferentes(data.referentes);
    };

    void loadDependencies();
  }, [open]);

  const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
    setTab(newValue);
    setSuccessMessage(null);
  };

  const handleAddReferente = () => {
    setMassive((prev) => ({
      ...prev,
      distribucion: [...prev.distribucion, { referenteId: "", cantidad: 1 }],
    }));
  };

  const handleRemoveReferente = (index: number) => {
    setMassive((prev) => ({
      ...prev,
      distribucion: prev.distribucion.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleCreateIndividual = async () => {
    setLoading(true);
    try {
      await createAula(form);
      onSaved();
      onClose();
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMassive = async () => {
    setLoading(true);
    try {
      const message = await createAulasMassive(massive);
      setSuccessMessage(message);
      onSaved();
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  const totalAsignado = massive.distribucion.reduce(
    (acc, item) => acc + (Number(item.cantidad) || 0),
    0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gestion de aulas</DialogTitle>

      <Box>
        <Tabs value={tab} onChange={handleTabChange} sx={{ ml: 1 }}>
          <Tab label="Crear aula" value="individual" />
          <Tab label="Creacion masiva" value="masivo" />
        </Tabs>
      </Box>

      <DialogContent>
        <Stack spacing={3} mt={2}>
          {tab === "individual" && (
            <>
              <TextField
                select
                label="Cohorte"
                value={form.cohorteId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cohorteId: event.target.value }))
                }
                fullWidth
              >
                <MenuItem value="" disabled>
                  Seleccionar cohorte
                </MenuItem>
                {cohortes.map((cohorte) => (
                  <MenuItem key={cohorte.id} value={cohorte.id}>
                    {cohorte.nombre} - {cohorte.postitulo?.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {user?.rol === "ADMIN" && (
                <Autocomplete
                  options={referentes}
                  getOptionLabel={(option) =>
                    `${option.nombre} ${option.apellido} - ${option.instituto?.nombre ?? "Sin instituto"}`
                  }
                  value={
                    referentes.find((referente) => referente.id === Number(form.referenteId)) || null
                  }
                  onChange={(_, value) =>
                    setForm((prev) => ({ ...prev, referenteId: value ? value.id : "" }))
                  }
                  renderInput={(params) => <TextField {...params} label="Referente" fullWidth />}
                />
              )}
            </>
          )}

          {tab === "masivo" && (
            <>
              <TextField
                select
                label="Cohorte"
                value={massive.cohorteId}
                onChange={(event) =>
                  setMassive((prev) => ({ ...prev, cohorteId: event.target.value }))
                }
                fullWidth
              >
                <MenuItem value="" disabled>
                  Seleccionar cohorte
                </MenuItem>
                {cohortes.map((cohorte) => (
                  <MenuItem key={cohorte.id} value={cohorte.id}>
                    {cohorte.nombre} - {cohorte.postitulo?.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Cantidad total de aulas"
                type="number"
                value={massive.total}
                onChange={(event) =>
                  setMassive((prev) => ({ ...prev, total: Number(event.target.value) }))
                }
                inputProps={{ min: 1 }}
              />

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  {massive.distribucion.map((item, index) => (
                    <Stack key={index} direction="row" alignItems="center" spacing={2}>
                      <Autocomplete
                        options={referentes}
                        sx={{ flex: 1 }}
                        getOptionLabel={(option) =>
                          `${option.nombre} ${option.apellido} - ${option.instituto?.nombre ?? "Sin instituto"}`
                        }
                        value={
                          referentes.find((referente) => referente.id === Number(item.referenteId)) || null
                        }
                        onChange={(_, value) =>
                          setMassive((prev) => ({
                            ...prev,
                            distribucion: prev.distribucion.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, referenteId: value ? value.id : "" } : row
                            ),
                          }))
                        }
                        renderInput={(params) => <TextField {...params} label="Referente" />}
                      />
                      <TextField
                        type="number"
                        label="Cantidad"
                        value={item.cantidad}
                        onChange={(event) =>
                          setMassive((prev) => ({
                            ...prev,
                            distribucion: prev.distribucion.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, cantidad: Number(event.target.value) } : row
                            ),
                          }))
                        }
                        sx={{ width: 120 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton color="error" onClick={() => handleRemoveReferente(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>

                <Button startIcon={<AddIcon />} onClick={handleAddReferente} sx={{ mt: 2 }}>
                  Agregar referente
                </Button>

                <Typography variant="body2" color="text.secondary" mt={2}>
                  Total asignado: <b>{totalAsignado}</b> / {massive.total}
                </Typography>

                {totalAsignado !== massive.total && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    La suma de aulas asignadas no coincide con el total.
                  </Alert>
                )}
              </Paper>

              {successMessage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ my: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        {tab === "individual" ? (
          <Button variant="contained" onClick={handleCreateIndividual} disabled={loading}>
            Crear aula
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={
              loading ||
              !massive.cohorteId ||
              massive.distribucion.some((item) => !item.referenteId || item.cantidad <= 0) ||
              totalAsignado !== massive.total
            }
            onClick={handleCreateMassive}
          >
            Crear aulas
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
