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
  Checkbox,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  getCohorteFormDependencies,
  saveCohorte,
  type CohorteFormData,
} from "@/features/cohortes/api";
import { Instituto } from "@/features/institutos";
import { Postitulo } from "@/features/postitulos";
import { Cohorte } from "@/features/cohortes/model/types";
import { Formulario } from "@/features/formularios/model/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  cohorte?: Cohorte | null;
}

const getInitialForm = (): CohorteFormData => ({
  anio: new Date().getFullYear(),
  fechaInicio: "",
  fechaFin: "",
  fechaInicioInscripcion: "",
  fechaFinInscripcion: "",
  postituloId: "",
  formularioId: "",
  cupos: "",
  cuposListaEspera: "",
  institutoIds: [],
});

export default function CohorteFormDialog({ open, onClose, onSaved, cohorte }: Props) {
  const [form, setForm] = useState<CohorteFormData>(getInitialForm());

  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [institutos, setInstitutos] = useState<Instituto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const dependencies = await getCohorteFormDependencies();
        setPostitulos(dependencies.postitulos);
        setFormularios(dependencies.formularios);
        setInstitutos(dependencies.institutos);
      } catch (err) {
        console.error("Error cargando datos de cohorte:", err);
      }
    };
    void fetchData();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (cohorte) {
      setForm({
        anio: cohorte.anio || new Date().getFullYear(),
        fechaInicio: cohorte.fechaInicio?.slice(0, 10) || "",
        fechaFin: cohorte.fechaFin?.slice(0, 10) || "",
        fechaInicioInscripcion: cohorte.fechaInicioInscripcion?.slice(0, 10) || "",
        fechaFinInscripcion: cohorte.fechaFinInscripcion?.slice(0, 10) || "",
        postituloId: cohorte.postitulo?.id || "",
        formularioId: cohorte.formulario?.id || "",
        cupos: cohorte.cupos || "",
        cuposListaEspera: cohorte.cuposListaEspera || "",
        institutoIds: cohorte.institutos?.map((instituto) => instituto.id) || [],
      });
      return;
    }

    setForm(getInitialForm());
  }, [cohorte, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await saveCohorte(form, cohorte?.id);

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
            label="Postitulo"
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
            label="Ano"
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

          <Autocomplete
            multiple
            disableCloseOnSelect
            options={institutos}
            value={institutos.filter((instituto) => form.institutoIds.includes(instituto.id))}
            onChange={(_, selectedInstitutos) =>
              setForm((prev) => ({
                ...prev,
                institutoIds: selectedInstitutos.map((instituto) => instituto.id),
              }))
            }
            getOptionLabel={(option) => option.nombre}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option, { selected }) => {
              const { key: optionKey, ...optionProps } = props;
              return (
                <li key={optionKey} {...optionProps}>
                  <Checkbox checked={selected} sx={{ mr: 1 }} />
                  {option.nombre}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Institutos"
                placeholder="Seleccionar uno o mas institutos"
              />
            )}
          />

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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Inicio inscripcion"
              name="fechaInicioInscripcion"
              type="date"
              value={form.fechaInicioInscripcion}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin inscripcion"
              name="fechaFinInscripcion"
              type="date"
              value={form.fechaFinInscripcion}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

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
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {cohorte ? "Guardar cambios" : "Crear cohorte"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
