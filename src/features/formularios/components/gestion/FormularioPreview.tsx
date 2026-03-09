"use client";

import {
  Stack,
  Paper,
  TextField,
  MenuItem,
  Autocomplete,
  Checkbox,
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
import { Distrito, listDistritos } from "@/features/formularios/api";
import { Formulario } from "@/features/formularios/model/types";

interface Props {
  formulario: Formulario;
}

interface FormDataState {
  distritoId: number | null;
  regionId: number | null;
  [key: string]: string | string[] | number | boolean | File | null;
}

const getFieldKey = (id: string | undefined, index: number) => id || `campo_${index}`;

export default function FormularioPreview({ formulario }: Props) {
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    distritoId: null,
    regionId: null,
  });

  useEffect(() => {
    const fetchDistritos = async () => {
      try {
        const nextDistritos = await listDistritos();
        setDistritos(nextDistritos);
      } catch (error) {
        console.error("Error cargando distritos:", error);
      }
    };
    void fetchDistritos();
  }, []);

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
      <Stack spacing={3}>
        {formulario.campos
          .filter((campo) => campo.id !== "region_residencia")
          .map((campo, index) => {
            const key = getFieldKey(campo.id, index);

            if (campo.id === "distrito_residencia") {
              return (
                <Autocomplete
                  key={key}
                  options={distritos}
                  getOptionLabel={(option) => `${option.nombre} - Region ${option.regionId}`}
                  value={distritos.find((d) => d.id === formData.distritoId) || null}
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
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              );
            }

            if (campo.id === "nivel_desempenio") {
              return (
                <TextField
                  key={key}
                  label={campo.label}
                  select
                  fullWidth
                  required={campo.required}
                  variant="outlined"
                  value={(formData[key] as string | undefined) ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
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
                  <MenuItem value="">Seleccione una opcion</MenuItem>
                  {nivelesDesempenio.map((nivel) => (
                    <MenuItem key={nivel} value={nivel}>
                      {nivel}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            if (campo.type === "select") {
              if (campo.multiple) {
                const value = (formData[key] as string[] | undefined) ?? [];

                return (
                  <Autocomplete
                    key={key}
                    multiple
                    disableCloseOnSelect
                    options={campo.options ?? []}
                    value={value}
                    onChange={(_, newValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: newValue,
                      }))
                    }
                    isOptionEqualToValue={(option, selected) => option === selected}
                    renderOption={(props, option, { selected }) => {
                      const { key: optionKey, ...optionProps } = props;
                      return (
                        <li key={optionKey} {...optionProps}>
                          <Checkbox checked={selected} sx={{ mr: 1 }} />
                          {option}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={campo.label}
                        fullWidth
                        required={campo.required}
                        placeholder="Seleccione una o mas opciones"
                      />
                    )}
                  />
                );
              }

              return (
                <TextField
                  key={key}
                  label={campo.label}
                  select
                  fullWidth
                  required={campo.required}
                  variant="outlined"
                  value={(formData[key] as string | undefined) ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
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
                  <MenuItem value="">Seleccione una opcion</MenuItem>
                  {campo.options?.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            if (["text", "email", "number", "date", "textarea"].includes(campo.type)) {
              return (
                <TextField
                  key={key}
                  label={campo.label}
                  type={campo.type === "textarea" ? "text" : campo.type}
                  required={campo.required}
                  fullWidth
                  multiline={campo.type === "textarea"}
                  minRows={campo.type === "textarea" ? 3 : undefined}
                  value={(formData[key] as string | number | undefined) ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              );
            }

            if (campo.type === "boolean") {
              return (
                <FormControl key={key} fullWidth>
                  <FormLabel sx={{ fontWeight: 500, mb: 1 }}>{campo.label}</FormLabel>
                  <RadioGroup
                    row
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: e.target.value === "true",
                      }))
                    }
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Si" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              );
            }

            if (campo.type === "file") {
              return (
                <Stack key={key} spacing={1}>
                  <FormLabel sx={{ fontWeight: 500 }}>
                    {campo.label}
                    {campo.required ? " *" : ""}
                  </FormLabel>

                  <Button variant="outlined" component="label">
                    Seleccionar archivo
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: e.target.files?.[0] || null,
                        }))
                      }
                    />
                  </Button>

                  {formData[key] instanceof File ? (
                    <Typography variant="caption" color="text.secondary">
                      {(formData[key] as File).name}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Permite adjuntar PDF, JPG o PNG
                    </Typography>
                  )}
                </Stack>
              );
            }

            return (
              <Typography key={key} color="text.secondary">
                Tipo de campo no soportado: {campo.type}
              </Typography>
            );
          })}
      </Stack>

      <Stack direction="row" justifyContent="flex-end" mt={6}>
        <Button variant="contained">Enviar</Button>
      </Stack>
    </Paper>
  );
}
