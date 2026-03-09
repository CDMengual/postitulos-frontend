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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useEffect, useMemo, useState } from "react";
import { nivelesDesempenio } from "@/constants/niveles";
import { Distrito, listDistritos, submitInscripcion, SubmitInscripcionError } from "@/features/formularios/api";
import { CampoFormulario, Formulario } from "@/features/formularios/model/types";
import { CohortePublica } from "@/features/cohortes/model/types";
import { appToast } from "@/shared/lib/toast";

interface Props {
  formulario: Formulario;
  cohorte: CohortePublica;
}

interface FormDataState {
  distritoId: number | null;
  regionId: number | null;
  [key: string]: string | string[] | number | boolean | File | null;
}

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

const getFieldKey = (campo: CampoFormulario, index: number) => campo.id || `campo_${index}`;

const normalizeKey = (key: string) => key.trim().toLowerCase();

const TOP_LEVEL_KEYS = new Set(["nombre", "apellido", "dni", "email", "celular"]);

export default function FormularioForm({ formulario, cohorte }: Props) {
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    distritoId: null,
    regionId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDistritos = async () => {
      try {
        const nextDistritos = await listDistritos();
        setDistritos(nextDistritos);
      } catch {
        appToast.error("No se pudieron cargar los distritos");
      }
    };
    void fetchDistritos();
  }, []);

  const isRequiredFieldComplete = (campo: CampoFormulario, index: number) => {
    if (!campo.required) return true;
    if (!campo.id) return true;
    if (campo.id === "region_residencia") return true;

    if (campo.id === "distrito_residencia") {
      return formData.distritoId !== null;
    }

    const key = getFieldKey(campo, index);
    const value = formData[key];

    if (campo.type === "boolean") return typeof value === "boolean";
    if (campo.type === "file") return value instanceof File;
    if (campo.type === "select" && campo.multiple) {
      return Array.isArray(value) && value.length > 0;
    }
    if (campo.type === "number") return !isEmptyValue(value);

    return !isEmptyValue(value);
  };

  const isFormComplete = useMemo(
    () =>
      formulario.campos
        .filter((campo) => campo.id !== "region_residencia")
        .every((campo, index) => isRequiredFieldComplete(campo, index)),
    [formData, formulario.campos]
  );

  const getTopLevelValue = (key: string) => {
    const normalizedTarget = normalizeKey(key);
    const foundEntry = Object.entries(formData).find(
      ([entryKey, entryValue]) =>
        normalizeKey(entryKey) === normalizedTarget &&
        typeof entryValue !== "boolean" &&
        !(entryValue instanceof File) &&
        !isEmptyValue(entryValue)
    );

    if (!foundEntry) return null;

    const raw = foundEntry[1];
    return raw === null || raw === undefined ? null : String(raw).trim();
  };

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    const nombre = getTopLevelValue("nombre");
    const apellido = getTopLevelValue("apellido");
    const dni = getTopLevelValue("dni");

    if (!nombre || !apellido || !dni) {
      appToast.error("Completá nombre, apellido y DNI");
      return;
    }

    const email = getTopLevelValue("email");
    const celular = getTopLevelValue("celular");

    try {
      setSubmitting(true);
      const fileEntries = Object.entries(formData).filter(([, value]) => value instanceof File) as Array<
        [string, File]
      >;

      const datosFormulario: Record<string, string | string[] | number | boolean | null> = {};
      Object.entries(formData).forEach(([key, value]) => {
        const normalized = normalizeKey(key);
        if (TOP_LEVEL_KEYS.has(normalized)) return;
        if (value instanceof File) return;
        if (value === undefined) return;
        datosFormulario[key] = value as string | number | boolean | null;
      });

      await submitInscripcion({
        cohorteId: cohorte.id,
        nombre,
        apellido,
        dni,
        email: email || null,
        celular: celular || null,
        datosFormulario,
        fileEntries,
      });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof SubmitInscripcionError) {
        if (err.status === 409 && err.appCode === "INSCRIPCION_DUPLICADA_COHORTE_DNI") {
          setDuplicateDialogOpen(true);
          return;
        }

        if (err.status === 400 && err.message === "La cohorte no tiene cupos disponibles") {
          appToast.error("La cohorte no tiene cupos disponibles");
          return;
        }
      }
      appToast.error("No se pudo enviar la inscripción");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
      {submitted ? (
        <Stack
          spacing={2.5}
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          sx={{ minHeight: 320, px: { xs: 1, md: 4 } }}
        >
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 72 }} />
          <Typography variant="h4" fontWeight={800} color="primary.main">
            Recibimos tu inscripción
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 820 }}>
            Gracias por completar el formulario. Recibimos tu inscripción y vamos a procesar la
            información y la documentación adjunta. Te avisaremos por los medios registrados cuando
            finalice la revisión, para confirmarte si se te asignó la vacante.
          </Typography>
        </Stack>
      ) : (
        <>
          <Stack spacing={3}>
            {formulario.campos
              .filter((campo) => campo.id !== "region_residencia")
              .map((campo, index) => {
                const key = getFieldKey(campo, index);

                if (campo.id === "distrito_residencia") {
                  return (
                    <Autocomplete
                      key={campo.id}
                      options={distritos}
                      getOptionLabel={(option) => `${option.nombre} - Región ${option.regionId}`}
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
                      key={campo.id}
                      label={campo.label}
                      select
                      fullWidth
                      required={campo.required}
                      variant="outlined"
                      value={(formData[key] as string) ?? ""}
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
                      <MenuItem value="">Seleccione una opción</MenuItem>
                      {nivelesDesempenio.map((nivel) => (
                        <MenuItem key={nivel} value={nivel}>
                          {nivel}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }

                if (campo.type === "select") {
                  const selectValue = (formData[key] as string | undefined) ?? "";
                  const multiSelectValue = (formData[key] as string[] | undefined) ?? [];

                  if (campo.multiple) {
                    return (
                      <Autocomplete
                        key={key}
                        multiple
                        disableCloseOnSelect
                        options={campo.options ?? []}
                        value={multiSelectValue}
                        onChange={(_, newValue) =>
                          setFormData((prev) => ({
                            ...prev,
                            [key]: newValue,
                          }))
                        }
                        isOptionEqualToValue={(option, value) => option === value}
                        renderOption={(props, option, { selected }) => {
                          const { key: optionKey, ...optionProps } = props;
                          return (
                            <li key={optionKey} {...optionProps}>
                              <Checkbox sx={{ mr: 1 }} checked={selected} />
                              {option}
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={campo.label}
                            required={campo.required}
                            placeholder={multiSelectValue.length === 0 ? "Seleccione una o más opciones" : ""}
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
                      value={selectValue}
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
                      <MenuItem value="">Seleccione una opción</MenuItem>
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
                      value={(formData[key] as string | number) ?? ""}
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
                    <FormControl key={key} fullWidth required={campo.required}>
                      <FormLabel sx={{ fontWeight: 500, mb: 1 }}>{campo.label}</FormLabel>
                      <RadioGroup
                        row
                        value={typeof formData[key] === "boolean" ? String(formData[key]) : ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [key]: e.target.value === "true",
                          }))
                        }
                      >
                        <FormControlLabel value="true" control={<Radio />} label="Sí" />
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

                      {formData[key] instanceof File && (
                        <Typography variant="caption" color="text.secondary">
                          {(formData[key] as File).name}
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
            <Button variant="contained" disabled={!isFormComplete || submitting} onClick={handleSubmit}>
              {submitting ? <CircularProgress size={16} color="inherit" /> : "Enviar"}
            </Button>
          </Stack>
        </>
      )}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inscripción ya registrada</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ya se registró una inscripción con este DNI para la cohorte seleccionada.
          </Typography>
          <Typography variant="body1">
            Si ingresaste algún dato incorrecto, escribinos a{" "}
            <Link href="mailto:postituloseducacionsuperior@abc.gob.ar">
              postituloseducacionsuperior@abc.gob.ar
            </Link>
            .
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
