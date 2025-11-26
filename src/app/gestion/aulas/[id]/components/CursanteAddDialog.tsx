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
import { useEffect, useState, SyntheticEvent, ChangeEvent } from "react";
import { AxiosError } from "axios";
import api from "@/services/api";
import { Cursante } from "@/types/cursante";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  open: boolean;
  onClose: () => void;
  aulaId: number;
  onCreated: () => void;
}

type TabValue = "buscar" | "crear" | "importar";

export default function CursanteAddDialog({
  open,
  onClose,
  aulaId,
  onCreated,
}: Props) {
  const [tab, setTab] = useState<TabValue>("buscar");

  // 🔍 Buscar cursante existente
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [options, setOptions] = useState<Cursante[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selected, setSelected] = useState<Cursante | null>(null);

  // 🧾 Crear cursante nuevo
  const [form, setForm] = useState<Omit<Cursante, "id">>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    celular: "",
    titulo: "",
  });

  // 📁 Carga masiva
  const [file, setFile] = useState<File | null>(null);
  const [duplicados, setDuplicados] = useState<Cursante[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // 🔍 Buscar cursantes con debounce
  useEffect(() => {
    const fetchData = async () => {
      if (debouncedSearch.length < 3 || tab !== "buscar") return;
      setLoadingSearch(true);
      try {
        const res = await api.get(
          `/cursantes?search=${debouncedSearch}&limit=10`
        );
        setOptions(res.data.data.cursantes);
      } catch (err) {
        console.error("Error al buscar cursantes:", err);
      } finally {
        setLoadingSearch(false);
      }
    };
    fetchData();
  }, [debouncedSearch, tab]);

  // 🔄 Cambio de pestañas (solo limpia búsqueda, no formularios)
  const handleTabChange = (_: SyntheticEvent, newValue: TabValue) => {
    setTab(newValue);
    setSearch("");
    setSelected(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🧩 Crear o vincular cursante
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload =
        tab === "buscar" && selected
          ? { dni: selected.dni, aulaId } // vincular existente
          : { ...form, aulaId }; // crear nuevo

      await api.post(`/aulas/${aulaId}/cursantes`, payload);
      onCreated();
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || "Error al guardar cursante");
    } finally {
      setLoading(false);
    }
  };

  // 📁 Importar Excel
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setDuplicados([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(
        `/aulas/${aulaId}/cursantes/import`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { importados, duplicados } = res.data.data as {
        importados: Cursante[];
        duplicados: Cursante[];
      };

      if (duplicados.length > 0) {
        setDuplicados(duplicados);
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Error al procesar archivo");
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
          {/* 🔍 Buscar cursante existente */}
          {tab === "buscar" && (
            <Autocomplete
              options={options}
              noOptionsText={
                search.length < 3
                  ? "Escribí al menos 3 caracteres"
                  : "No se encontraron cursantes"
              }
              getOptionLabel={(option) =>
                `${option.apellido} ${option.nombre} (${option.dni})`
              }
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

          {/* 🧾 Crear cursante nuevo */}
          {tab === "crear" && (
            <Stack spacing={2}>
              <TextField
                name="dni"
                label="DNI"
                value={form.dni}
                onChange={handleChange}
                required
              />
              <TextField
                name="nombre"
                label="Nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
              <TextField
                name="apellido"
                label="Apellido"
                value={form.apellido}
                onChange={handleChange}
                required
              />
              <TextField
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                name="celular"
                label="Celular"
                value={form.celular}
                onChange={handleChange}
              />
              <TextField
                name="titulo"
                label="Título"
                value={form.titulo}
                onChange={handleChange}
              />
            </Stack>
          )}

          {/* 📁 Carga masiva */}
          {tab === "importar" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Subí un archivo Excel con los campos:{" "}
                <strong>dni, nombre, apellido, email, celular, título</strong>
              </Typography>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              {error && <Alert severity="error">{error}</Alert>}
              {duplicados.length > 0 && (
                <Alert severity="warning">
                  {duplicados.length} cursantes ya estaban en esta aula:
                  <ul>
                    {duplicados.map((d, i) => (
                      <li key={i}>{`${d.nombre} ${d.apellido} (${d.dni})`}</li>
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
          <Button
            variant="contained"
            disabled={!file || loading}
            onClick={handleImport}
          >
            {loading ? "Procesando..." : "Importar"}
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={
              loading ||
              (tab === "buscar" && !selected) ||
              (tab === "crear" && !form.dni)
            }
            onClick={handleSubmit}
          >
            {loading ? "Guardando..." : tab === "buscar" ? "Vincular" : "Crear"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
