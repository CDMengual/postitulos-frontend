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
import { useEffect, useState, SyntheticEvent } from "react";
import api from "@/services/api";
import { useUserContext } from "@/components/providers/UserProvider";
import { User } from "@/types/user";
import { Cohorte } from "@/types/cohorte";

type TabValue = "individual" | "masivo";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface Distribucion {
  referenteId: number | "";
  cantidad: number;
}

export default function AulaFormDialog({ open, onClose, onSaved }: Props) {
  const { user } = useUserContext();
  const [tab, setTab] = useState<TabValue>("individual");
  const [loading, setLoading] = useState(false);

  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [referentes, setReferentes] = useState<User[]>([]);

  // Individual
  const [form, setForm] = useState<{
    cohorteId: string;
    referenteId: number | "";
  }>({
    cohorteId: "",
    referenteId: "",
  });

  // Masivo
  const [massive, setMassive] = useState({
    cohorteId: "",
    total: 1,
    distribucion: [] as Distribucion[],
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      const [cohortesRes, refsRes] = await Promise.all([
        api.get("/cohortes"),
        api.get("/users?rol=REFERENTE"),
      ]);
      setCohortes(cohortesRes.data.data);
      setReferentes(refsRes.data.data);
    };
    fetchData();
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
      distribucion: prev.distribucion.filter((_, i) => i !== index),
    }));
  };

  // 🧩 Crear una sola
  const handleCreateIndividual = async () => {
    setLoading(true);
    try {
      await api.post("/aulas", form);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Crear masivas con distribución
  const handleCreateMassive = async () => {
    setLoading(true);
    try {
      const body = {
        cohorteId: massive.cohorteId,
        total: massive.total,
        distribucion: massive.distribucion.map((d) => ({
          referenteId: d.referenteId,
          cantidad: d.cantidad,
        })),
      };
      const res = await api.post("/aulas/massive", body);
      setSuccessMessage(res.data.message || "Aulas creadas correctamente");
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAsignado = massive.distribucion.reduce(
    (acc, d) => acc + (Number(d.cantidad) || 0),
    0
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Gestión de aulas</DialogTitle>

      <Box>
        <Tabs value={tab} onChange={handleTabChange} sx={{ ml: 1 }}>
          <Tab label="Crear aula" value="individual" />
          <Tab label="Creación masiva" value="masivo" />
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, cohorteId: e.target.value }))
                }
                fullWidth
              >
                <MenuItem value="" disabled>
                  Seleccionar cohorte
                </MenuItem>
                {cohortes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombre} — {c.postitulo?.nombre}
                  </MenuItem>
                ))}
              </TextField>

              {user?.rol === "ADMIN" && (
                <Autocomplete
                  options={referentes}
                  getOptionLabel={(o) =>
                    `${o.nombre} ${o.apellido} — ${
                      o.instituto?.nombre ?? "Sin instituto"
                    }`
                  }
                  value={
                    referentes.find((r) => r.id === Number(form.referenteId)) ||
                    null
                  }
                  onChange={(_, val) =>
                    setForm((p) => ({ ...p, referenteId: val ? val.id : "" }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Referente" fullWidth />
                  )}
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
                onChange={(e) =>
                  setMassive((p) => ({ ...p, cohorteId: e.target.value }))
                }
                fullWidth
              >
                <MenuItem value="" disabled>
                  Seleccionar cohorte
                </MenuItem>
                {cohortes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombre} — {c.postitulo?.nombre}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Cantidad total de aulas"
                type="number"
                value={massive.total}
                onChange={(e) =>
                  setMassive((p) => ({
                    ...p,
                    total: Number(e.target.value),
                  }))
                }
                inputProps={{ min: 1 }}
              />

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  {massive.distribucion.map((d, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                    >
                      <Autocomplete
                        options={referentes}
                        sx={{ flex: 1 }}
                        getOptionLabel={(o) =>
                          `${o.nombre} ${o.apellido} — ${
                            o.instituto?.nombre ?? "Sin instituto"
                          }`
                        }
                        value={
                          referentes.find(
                            (r) => r.id === Number(d.referenteId)
                          ) || null
                        }
                        onChange={(_, val) =>
                          setMassive((p) => ({
                            ...p,
                            distribucion: p.distribucion.map((r, idx) =>
                              idx === i
                                ? { ...r, referenteId: val ? val.id : "" }
                                : r
                            ),
                          }))
                        }
                        renderInput={(params) => (
                          <TextField {...params} label="Referente" />
                        )}
                      />
                      <TextField
                        type="number"
                        label="Cantidad"
                        value={d.cantidad}
                        onChange={(e) =>
                          setMassive((p) => ({
                            ...p,
                            distribucion: p.distribucion.map((r, idx) =>
                              idx === i
                                ? { ...r, cantidad: Number(e.target.value) }
                                : r
                            ),
                          }))
                        }
                        sx={{ width: 120 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveReferente(i)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddReferente}
                  sx={{ mt: 2 }}
                >
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
        <Button onClick={onClose}>Cancelar</Button>
        {tab === "individual" ? (
          <Button
            variant="contained"
            onClick={handleCreateIndividual}
            disabled={loading}
          >
            Crear aula
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={
              loading ||
              !massive.cohorteId ||
              massive.distribucion.some(
                (d) => !d.referenteId || d.cantidad <= 0
              ) ||
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
