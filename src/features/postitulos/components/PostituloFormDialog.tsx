"use client";

import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { savePostitulo, type PostituloFormData } from "@/features/postitulos/api";
import { Postitulo } from "@/features/postitulos/model/types";
import { appToast } from "@/shared/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  postitulo?: Postitulo | null;
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

export default function PostituloFormDialog({ open, onClose, onSaved, postitulo }: Props) {
  const [form, setForm] = useState<PostituloFormData>(initialFormState);
  const [loading, setLoading] = useState(false);

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
            ? postitulo.tipos.map((tipo) => ({
                tipo: tipo.tipo,
                titulo: tipo.titulo,
              }))
            : [{ tipo: "ESPECIALIZACION", titulo: "" }],
      });
      return;
    }

    setForm(initialFormState);
  }, [postitulo, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (index: number, field: "tipo" | "titulo", value: string) => {
    setForm((prev) => {
      const nextTipos = [...prev.tipos];
      nextTipos[index] = { ...nextTipos[index], [field]: value };

      return { ...prev, tipos: nextTipos };
    });
  };

  const handleAddTipo = () => {
    setForm((prev) => ({
      ...prev,
      tipos: [...prev.tipos, { tipo: "ESPECIALIZACION", titulo: "" }],
    }));
  };

  const handleRemoveTipo = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tipos: prev.tipos.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleClose = () => {
    setForm(initialFormState);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await savePostitulo(form, postitulo?.id);
      appToast.success(postitulo ? "Postitulo actualizado con exito" : "Postitulo creado con exito");
      onSaved();
      handleClose();
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{postitulo ? "Editar postitulo" : "Nuevo postitulo"}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          <Stack direction="row" spacing={2}>
            <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} fullWidth />
            <TextField label="Codigo" name="codigo" value={form.codigo} onChange={handleChange} fullWidth />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Coordinadores"
              name="coordinadores"
              value={form.coordinadores}
              onChange={handleChange}
              fullWidth
            />
            <TextField label="Autores" name="autores" value={form.autores} onChange={handleChange} fullWidth />
          </Stack>

          <TextField
            label="Descripcion"
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
            <TextField label="Resolucion" name="resolucion" value={form.resolucion} onChange={handleChange} fullWidth />
            <TextField
              label="Resolucion puntaje"
              name="resolucionPuntaje"
              value={form.resolucionPuntaje}
              onChange={handleChange}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField label="Dictamen" name="dictamen" value={form.dictamen} onChange={handleChange} fullWidth />
            <TextField label="Modalidad" name="modalidad" value={form.modalidad} onChange={handleChange} fullWidth />
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
              label="Horas sincronicas"
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

          <Typography fontWeight={600}>Tipos y titulos</Typography>

          <Stack spacing={2}>
            {form.tipos.map((tipo, index) => (
              <Stack
                key={index}
                p={2}
                spacing={2}
                border="1px solid #ddd"
                borderRadius={2}
                position="relative"
                sx={{ backgroundColor: "#fafafa" }}
              >
                <Stack direction="row" spacing={2}>
                  <TextField
                    select
                    label="Tipo"
                    value={tipo.tipo}
                    onChange={(event) => handleTipoChange(index, "tipo", event.target.value)}
                    fullWidth
                  >
                    <MenuItem value="ESPECIALIZACION">Especializacion</MenuItem>
                    <MenuItem value="DIPLOMATURA">Diplomatura</MenuItem>
                    <MenuItem value="ACTUALIZACION">Actualizacion</MenuItem>
                  </TextField>

                  <TextField
                    label="Titulo"
                    value={tipo.titulo}
                    onChange={(event) => handleTipoChange(index, "titulo", event.target.value)}
                    fullWidth
                  />
                </Stack>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveTipo(index)}
                    disabled={form.tipos.length === 1}
                    startIcon={<DeleteIcon />}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            ))}

            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddTipo} sx={{ alignSelf: "center" }}>
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
          {loading ? (
            <CircularProgress size={14} color="inherit" />
          ) : postitulo ? (
            "Guardar cambios"
          ) : (
            "Crear postitulo"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
