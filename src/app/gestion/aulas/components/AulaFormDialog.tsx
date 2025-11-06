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
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useUserContext } from "@/components/providers/UserProvider";
import { Postitulo } from "@/types/postitulo";
import { User } from "@/types/user";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface AulaFormData {
  cohorte: number;
  numero: number;
  postituloId: number | "";
  referenteId?: number | "";
}

export default function AulaFormDialog({ open, onClose, onSaved }: Props) {
  const { user } = useUserContext();
  const [form, setForm] = useState<AulaFormData>({
    cohorte: new Date().getFullYear(),
    numero: 1,
    postituloId: "",
    referenteId: "",
  });
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [referentes, setReferentes] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const [posts, refs] = await Promise.all([
          api.get("/postitulos"),
          api.get("/users?rol=REFERENTE"),
        ]);
        setPostitulos(posts.data.data);
        setReferentes(refs.data.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    fetchData();
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/aulas", form);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error creando aula:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva Aula</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Cohorte"
            name="cohorte"
            type="number"
            value={form.cohorte}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Número de Aula"
            name="numero"
            type="number"
            value={form.numero}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Postítulo"
            name="postituloId"
            value={form.postituloId}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">Seleccionar</MenuItem>
            {postitulos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
          {user?.rol === "ADMIN" && (
            <Autocomplete
              options={referentes}
              getOptionLabel={(option) =>
                `${option.nombre} ${option.apellido} — ${
                  option.instituto?.nombre ?? "Sin instituto"
                } (${option.instituto?.distrito?.nombre ?? "-"})`
              }
              value={referentes.find((r) => r.id === form.referenteId) || null}
              onChange={(_, newValue) =>
                setForm((prev) => ({
                  ...prev,
                  referenteId: newValue ? newValue.id : "",
                }))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Referente"
                  placeholder="Buscar referente"
                  fullWidth
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ my: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Crear aula
        </Button>
      </DialogActions>
    </Dialog>
  );
}
