"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "@/services/api";
import { Postitulo } from "@/types/postitulo";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  postitulo?: Postitulo | null;
}

interface PostituloTipoForm {
  tipo: "ESPECIALIZACION" | "DIPLOMATURA" | "ACTUALIZACION";
  titulo: string;
}

interface PostituloFormData {
  nombre: string;
  codigo: string;
  destinatarios: string;
  descripcion: string;
  autores: string;
  coordinadores: string;
  resolucion: string;
  resolucionPuntaje: string;
  dictamen: string;
  modalidad: string;
  cargaHoraria: number | "";
  horasSincronicas: number | "";
  horasVirtuales: number | "";
  tipos: PostituloTipoForm[];
}

const initialFormState: PostituloFormData = {
  nombre: "",
  codigo: "",
  destinatarios: "",
  descripcion: "",
  autores: "",
  coordinadores: "",
  resolucion: "",
  resolucionPuntaje: "",
  dictamen: "",
  modalidad: "",
  cargaHoraria: "",
  horasSincronicas: "",
  horasVirtuales: "",
  tipos: [{ tipo: "ESPECIALIZACION", titulo: "" }],
};

export default function PostituloFormDialog({
  open,
  onClose,
  onSaved,
  postitulo,
}: Props) {
  const [form, setForm] = useState<PostituloFormData>(initialFormState);
  const [loading, setLoading] = useState(false);

  // Prellenar si se edita
  useEffect(() => {
    if (postitulo) {
      setForm({
        nombre: postitulo.nombre || "",
        codigo: postitulo.codigo || "",
        destinatarios: postitulo.destinatarios || "",
        descripcion: postitulo.descripcion || "",
        autores: postitulo.autores || "",
        coordinadores: postitulo.coordinadores || "",
        resolucion: postitulo.resolucion || "",
        resolucionPuntaje: postitulo.resolucionPuntaje || "",
        dictamen: postitulo.dictamen || "",
        modalidad: postitulo.modalidad || "",
        cargaHoraria: postitulo.cargaHoraria ?? "",
        horasSincronicas: postitulo.horasSincronicas ?? "",
        horasVirtuales: postitulo.horasVirtuales ?? "",
        tipos:
          postitulo.tipos?.length > 0
            ? postitulo.tipos.map((t) => ({
                tipo: t.tipo,
                titulo: t.titulo,
              }))
            : [{ tipo: "ESPECIALIZACION", titulo: "" }],
      });
    } else {
      setForm(initialFormState);
    }
  }, [postitulo, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (
    index: number,
    field: keyof PostituloTipoForm,
    value: string
  ) => {
    setForm((prev) => {
      const updated = [...prev.tipos];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, tipos: updated };
    });
  };

  const addTipo = () => {
    setForm((prev) => ({
      ...prev,
      tipos: [...prev.tipos, { tipo: "ESPECIALIZACION", titulo: "" }],
    }));
  };

  const removeTipo = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tipos: prev.tipos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = { ...form };

      if (postitulo) {
        await api.patch(`/postitulos/${postitulo.id}`, payload);
      } else {
        await api.post("/postitulos", payload);
      }

      onSaved();
      handleClose();
    } catch (err) {
      console.error("Error guardando postítulo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialFormState);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {postitulo ? "Editar Postítulo" : "Nuevo Postítulo"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Campos principales */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Código"
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Coordinadores"
              name="coordinadores"
              value={form.coordinadores}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Autores"
              name="autores"
              value={form.autores}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <TextField
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Destinatarios"
            name="destinatarios"
            value={form.destinatarios}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Resolución"
              name="resolucion"
              value={form.resolucion}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Resolución Puntaje"
              name="resolucionPuntaje"
              value={form.resolucionPuntaje}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Dictamen"
              name="dictamen"
              value={form.dictamen}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Modalidad"
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Carga horaria total"
              name="cargaHoraria"
              type="number"
              value={form.cargaHoraria}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Horas sincrónicas"
              name="horasSincronicas"
              type="number"
              value={form.horasSincronicas}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Horas virtuales"
              name="horasVirtuales"
              type="number"
              value={form.horasVirtuales}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Typography fontWeight={600}>Tipos y títulos</Typography>

          <Stack spacing={2}>
            {form.tipos.map((t, index) => (
              <Stack
                key={index}
                p={2}
                spacing={2}
                border="1px solid #ddd"
                borderRadius={2}
                position="relative"
                sx={{
                  backgroundColor: "#fafafa",
                }}
              >
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Tipo"
                    value={t.tipo}
                    onChange={(e) =>
                      handleTipoChange(index, "tipo", e.target.value)
                    }
                    fullWidth
                  >
                    <MenuItem value="ESPECIALIZACION">Especialización</MenuItem>
                    <MenuItem value="DIPLOMATURA">Diplomatura</MenuItem>
                    <MenuItem value="ACTUALIZACION">Actualización</MenuItem>
                  </TextField>

                  <TextField
                    label="Título"
                    value={t.titulo}
                    onChange={(e) =>
                      handleTipoChange(index, "titulo", e.target.value)
                    }
                    fullWidth
                  />
                </Stack>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeTipo(index)}
                    disabled={form.tipos.length === 1}
                    startIcon={<DeleteIcon />}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addTipo}
              sx={{ alignSelf: "flex-center" }}
            >
              Agregar tipo
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ my: 2, mx: 4 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {postitulo ? "Guardar cambios" : "Crear Postítulo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
