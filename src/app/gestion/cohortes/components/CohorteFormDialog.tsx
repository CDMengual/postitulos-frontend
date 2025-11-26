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
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Postitulo } from "@/types/postitulo";
import { Cohorte } from "@/types/cohorte";
import { Formulario } from "@/types/formulario";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  cohorte?: Cohorte | null;
}

interface CohorteFormData {
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  fechaInicioInscripcion?: string;
  fechaFinInscripcion?: string;
  postituloId: number | "";
  formularioId?: number | "";
  cupos: number | "";
  cuposListaEspera: number | "";
}

export default function CohorteFormDialog({
  open,
  onClose,
  onSaved,
  cohorte,
}: Props) {
  const [form, setForm] = useState<CohorteFormData>({
    anio: new Date().getFullYear(),
    fechaInicio: "",
    fechaFin: "",
    fechaInicioInscripcion: "",
    fechaFinInscripcion: "",
    postituloId: "",
    cupos: "",
    cuposListaEspera: "",
  });

  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Cargar postítulos al abrir el modal
  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const res = await api.get("/postitulos");
        setPostitulos(res.data.data);
        const resForms = await api.get("/formularios");
        setFormularios(resForms.data.data);
      } catch (err) {
        console.error("Error cargando postitulos:", err);
      }
    };
    fetchData();
  }, [open]);

  // 🔹 Inicializar o resetear formulario cuando cambia cohorte
  useEffect(() => {
    if (cohorte) {
      setForm({
        anio: cohorte.anio || new Date().getFullYear(),
        fechaInicio: cohorte.fechaInicio?.slice(0, 10) || "",
        fechaFin: cohorte.fechaFin?.slice(0, 10) || "",
        fechaInicioInscripcion:
          cohorte.fechaInicioInscripcion?.slice(0, 10) || "",
        fechaFinInscripcion: cohorte.fechaFinInscripcion?.slice(0, 10) || "",
        postituloId: cohorte.postitulo?.id || "",
        cupos: cohorte.cupos || "",
        cuposListaEspera: cohorte.cuposListaEspera || "",
      });
    } else {
      setForm({
        anio: new Date().getFullYear(),
        fechaInicio: "",
        fechaFin: "",
        fechaInicioInscripcion: "",
        fechaFinInscripcion: "",
        postituloId: "",
        cupos: "",
        cuposListaEspera: "",
      });
    }
  }, [cohorte, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (cohorte) {
        await api.patch(`/cohortes/${cohorte.id}`, form);
      } else {
        await api.post("/cohortes", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error guardando cohorte:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{cohorte ? "Editar cohorte" : "Crear cohorte"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            select
            label="Postítulo"
            name="postituloId"
            value={form.postituloId}
            onChange={handleChange}
            fullWidth
          >
            {postitulos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Año"
            name="anio"
            type="number"
            value={form.anio}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Formulario"
            name="formularioId"
            value={form.formularioId || ""}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">Sin formulario</MenuItem>
            {formularios.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.nombre} ({f.postitulo?.codigo})
              </MenuItem>
            ))}
          </TextField>

          {/* 🧩 Fechas de cursada */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Inicio cursada"
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin cursada"
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          {/* 🧩 Fechas de inscripción */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Inicio inscripción"
              name="fechaInicioInscripcion"
              type="date"
              value={form.fechaInicioInscripcion}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin inscripción"
              name="fechaFinInscripcion"
              type="date"
              value={form.fechaFinInscripcion}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          {/* Cupos */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Cupos"
              name="cupos"
              type="number"
              value={form.cupos}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Cupos lista de espera"
              name="cuposListaEspera"
              type="number"
              value={form.cuposListaEspera}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {cohorte ? "Guardar cambios" : "Crear cohorte"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
