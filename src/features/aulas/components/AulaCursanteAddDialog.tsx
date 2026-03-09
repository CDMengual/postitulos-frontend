"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Autocomplete,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { addAulaCursante, importAulaCursantes, searchCursantes } from "@/features/aulas/api";
import { Cursante, CursanteFormData } from "@/features/cursantes/model/types";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface Props {
  open: boolean;
  onClose: () => void;
  aulaId: number;
  onCreated: () => void;
}

type TabValue = "buscar" | "crear" | "importar";

export default function AulaCursanteAddDialog({ open, onClose, aulaId, onCreated }: Props) {
  const [tab, setTab] = useState<TabValue>("buscar");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [options, setOptions] = useState<Cursante[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selected, setSelected] = useState<Cursante | null>(null);
  const [form, setForm] = useState<CursanteFormData>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    celular: "",
    titulo: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [duplicados, setDuplicados] = useState<Cursante[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedSearch.length < 3 || tab !== "buscar") return;
      setLoadingSearch(true);
      try {
        const nextOptions = await searchCursantes(debouncedSearch, 10);
        setOptions(nextOptions);
      } finally {
        setLoadingSearch(false);
      }
    };

    void fetchData();
  }, [debouncedSearch, tab]);

  const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
    setTab(newValue);
    setSearch("");
    setSelected(null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload =
        tab === "buscar" && selected ? { dni: selected.dni, aulaId } : { ...form, aulaId };

      await addAulaCursante(aulaId, payload);
      onCreated();
      onClose();
    } catch (err) {
      const errorResponse = err as AxiosError<{ message?: string }>;
      alert(errorResponse.response?.data?.message || "Error al guardar cursante");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDuplicados([]);

    try {
      const result = await importAulaCursantes(aulaId, file);
      if (result.duplicados.length > 0) {
        setDuplicados(result.duplicados);
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      const errorResponse = err as AxiosError<{ message?: string }>;
      setError(errorResponse.response?.data?.message || "Error al procesar archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Inscribir cursantes en el aula</DialogTitle>

      <Box>
        <Tabs value={tab} onChange={handleTabChange} sx={{ ml: 1 }}>
          <Tab label="Buscar existente" value="buscar" />
          <Tab label="Crear nuevo" value="crear" />
          <Tab label="Carga masiva (Excel)" value="importar" />
        </Tabs>
      </Box>

      <DialogContent>
        <Stack spacing={3} mt={2}>
          {tab === "buscar" && (
            <Autocomplete
              options={options}
              noOptionsText={
                search.length < 3 ? "Escribi al menos 3 caracteres" : "No se encontraron cursantes"
              }
              getOptionLabel={(option) => `${option.apellido} ${option.nombre} (${option.dni})`}
              loading={loadingSearch}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, value) => setSelected(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar cursante"
                  placeholder="Buscar por nombre, apellido o DNI"
                />
              )}
            />
          )}

          {tab === "crear" && (
            <Stack spacing={2}>
              <TextField name="dni" label="DNI" value={form.dni} onChange={handleChange} required />
              <TextField name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} required />
              <TextField name="apellido" label="Apellido" value={form.apellido} onChange={handleChange} required />
              <TextField name="email" label="Email" value={form.email} onChange={handleChange} />
              <TextField name="celular" label="Celular" value={form.celular} onChange={handleChange} />
              <TextField name="titulo" label="Titulo" value={form.titulo} onChange={handleChange} />
            </Stack>
          )}

          {tab === "importar" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Subi un archivo Excel con los campos:{" "}
                <strong>dni, nombre, apellido, email, celular, titulo</strong>
              </Typography>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
              {error && <Alert severity="error">{error}</Alert>}
              {duplicados.length > 0 && (
                <Alert severity="warning">
                  {duplicados.length} cursantes ya estaban en esta aula:
                  <ul>
                    {duplicados.map((duplicado, index) => (
                      <li key={index}>{`${duplicado.nombre} ${duplicado.apellido} (${duplicado.dni})`}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>

        {tab === "importar" ? (
          <Button variant="contained" disabled={!file || loading} onClick={handleImport}>
            {loading ? "Procesando..." : "Importar"}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={loading || (tab === "buscar" && !selected) || (tab === "crear" && !form.dni)}
            onClick={handleSubmit}
          >
            {loading ? "Guardando..." : tab === "buscar" ? "Vincular" : "Crear"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
