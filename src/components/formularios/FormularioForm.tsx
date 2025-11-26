"use client";

import {
  Stack,
  Paper,
  TextField,
  MenuItem,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { nivelesDesempenio } from "@/constants/niveles";
import api from "@/services/api";
import { Formulario } from "@/types/formulario";
import { CohortePublica } from "@/types/cohorte";

interface Props {
  formulario: Formulario;
  cohorte: CohortePublica;
}

interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}

interface FormDataState {
  distritoId: number | null;
  regionId: number | null;
  [key: string]: string | number | boolean | File | null;
}

export default function FormularioForm({ formulario }: Props) {
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    distritoId: null,
    regionId: null,
  });

  useEffect(() => {
    const fetchDistritos = async () => {
      try {
        const res = await api.get("/distritos");
        setDistritos(res.data.data);
      } catch (error) {
        console.error("Error cargando distritos:", error);
      }
    };
    fetchDistritos();
  }, []);

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
      <Stack spacing={3}>
        {formulario.campos
          .filter((campo) => campo.id !== "region_residencia")
          .map((campo) => {
            // Campo especial: distrito_residencia
            if (campo.id === "distrito_residencia") {
              return (
                <Autocomplete
                  key={campo.id}
                  options={distritos}
                  getOptionLabel={(option) =>
                    `${option.nombre} — Región ${option.regionId}`
                  }
                  value={
                    distritos.find((d) => d.id === formData.distritoId) || null
                  }
                  onChange={(_, newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      distritoId: newValue ? newValue.id : null,
                      regionId: newValue ? newValue.regionId : null,
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={campo.label}
                      placeholder="Seleccionar distrito"
                      fullWidth
                      required={campo.required}
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                />
              );
            }

            // Campo especial: nivel_desempenio
            if (campo.id === "nivel_desempenio") {
              return (
                <TextField
                  key={campo.id}
                  label={campo.label}
                  select
                  fullWidth
                  required={campo.required}
                  variant="outlined"
                  defaultValue=""
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [String(campo.id)]: e.target.value,
                    }))
                  }
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxWidth: 500,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">Seleccione una opción</MenuItem>
                  {nivelesDesempenio.map((nivel) => (
                    <MenuItem key={nivel} value={nivel}>
                      {nivel}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            // Campos tipo select (genéricos)
            if (campo.type === "select") {
              return (
                <TextField
                  key={campo.id}
                  label={campo.label}
                  select
                  fullWidth
                  required={campo.required}
                  variant="outlined"
                  defaultValue=""
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [String(campo.id)]: e.target.value,
                    }))
                  }
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxWidth: 500,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="">Seleccione una opción</MenuItem>
                  {campo.options?.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            // Campos de texto / email / número
            if (["text", "email", "number"].includes(campo.type)) {
              return (
                <TextField
                  key={campo.id}
                  label={campo.label}
                  type={campo.type}
                  required={campo.required}
                  fullWidth
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [String(campo.id)]: e.target.value,
                    }))
                  }
                />
              );
            }

            // Campos booleanos
            if (campo.type === "boolean") {
              return (
                <FormControl key={campo.id} fullWidth>
                  <FormLabel sx={{ fontWeight: 500, mb: 1 }}>
                    {campo.label}
                  </FormLabel>
                  <RadioGroup
                    row
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [String(campo.id)]: e.target.value === "true",
                      }))
                    }
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Sí"
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              );
            }

            if (campo.type === "file") {
              return (
                <Stack key={campo.id} spacing={1}>
                  <FormLabel sx={{ fontWeight: 500 }}>{campo.label}</FormLabel>

                  <Button variant="outlined" component="label">
                    Seleccionar archivo
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [String(campo.id)]: e.target.files?.[0] || null,
                        }))
                      }
                    />
                  </Button>

                  {formData[campo.id || ""] instanceof File && (
                    <Typography variant="caption" color="text.secondary">
                      {(formData[campo.id || ""] as File).name}
                    </Typography>
                  )}
                </Stack>
              );
            }

            return (
              <Typography key={campo.id} color="text.secondary">
                Tipo de campo no soportado: {campo.type}
              </Typography>
            );
          })}
      </Stack>

      {/* Botón de acción */}
      <Stack direction="row" justifyContent="flex-end" mt={6}>
        <Button variant="contained">Enviar</Button>
      </Stack>
    </Paper>
  );
}
