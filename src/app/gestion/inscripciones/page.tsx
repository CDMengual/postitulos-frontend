"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "@/services/api";
import { useUserContext } from "@/components/providers/UserProvider";
import { Cohorte } from "@/types/cohorte";
import {
  getDocumentacionCursanteMeta,
  getEstadoInscripcionPrivadaMeta,
} from "@/constants/pillColor";
import {
  DocumentacionInscripcion,
  EstadoInscripcionPrivada,
  InscripcionDetalleApiResponse,
  InscripcionListadoItem,
  InscripcionesListApiResponse,
} from "@/types/inscripcion";
import { useDebounce } from "@/hooks/useDebounce";
import { appToast } from "@/utils/toast";
import { updateItemInArray } from "@/utils/localUpdate";
import InscripcionesTable from "./components/InscripcionesTable";

type CohorteOption = Pick<Cohorte, "id" | "nombre" | "anio" | "institutos">;

const ESTADOS: EstadoInscripcionPrivada[] = ["PENDIENTE", "ASIGNADA", "LISTA_ESPERA", "RECHAZADA"];

const DOCUMENTACIONES: DocumentacionInscripcion[] = ["VERIFICADA", "PENDIENTE", "NO_CORRESPONDE"];

type InstitutoOption = { id: number; nombre: string; regionId: number | null };

type MassAssignmentDraft = {
  inscriptoId: number;
  institutoId: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  regionId: number | null;
};

interface DistritoRef {
  id: number;
  regionId: number | null;
}

export default function InscripcionesPage() {
  const { user } = useUserContext();
  const searchParams = useSearchParams();
  const cohorteIdFromUrl = searchParams.get("cohorteId") ?? "";
  const [rows, setRows] = useState<InscripcionListadoItem[]>([]);
  const [cohortes, setCohortes] = useState<CohorteOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [savingRowIds, setSavingRowIds] = useState<number[]>([]);
  const [openMassAssignDialog, setOpenMassAssignDialog] = useState(false);
  const [buildingMassAssign, setBuildingMassAssign] = useState(false);
  const [savingMassAssign, setSavingMassAssign] = useState(false);
  const [massAssignments, setMassAssignments] = useState<MassAssignmentDraft[]>([]);
  const [massAssignInstitutos, setMassAssignInstitutos] = useState<InstitutoOption[]>([]);

  const [cohorteId, setCohorteId] = useState(cohorteIdFromUrl);
  const [estado, setEstado] = useState("");
  const [documentacion, setDocumentacion] = useState("");
  const [search, setSearch] = useState("");
  const isAdmin = user?.rol === "ADMIN";
  const isReferente = user?.rol === "REFERENTE";

  const debouncedSearch = useDebounce(search, 400);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    if (cohorteId) params.set("cohorteId", cohorteId);
    if (estado) params.set("estado", estado);
    if (documentacion) params.set("documentacion", documentacion);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    return params.toString();
  }, [page, pageSize, cohorteId, estado, documentacion, debouncedSearch]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const prioridadA = a.prioridad ?? Number.NEGATIVE_INFINITY;
      const prioridadB = b.prioridad ?? Number.NEGATIVE_INFINITY;
      if (prioridadA !== prioridadB) return prioridadB - prioridadA;

      const fechaA = new Date(a.createdAt).getTime();
      const fechaB = new Date(b.createdAt).getTime();
      return fechaB - fechaA;
    });
  }, [rows]);

  const visibleCohortes = useMemo(() => {
    if (!isReferente) return cohortes;
    const institutoId = user?.institutoId;
    if (!institutoId) return [];

    return cohortes.filter((cohorte) =>
      (cohorte.institutos ?? []).some((instituto) => instituto.id === institutoId)
    );
  }, [cohortes, isReferente, user?.institutoId]);

  const allowedInstitutosByCohorte = useMemo(() => {
    return visibleCohortes.reduce<Record<number, { id: number; nombre: string }[]>>(
      (acc, cohorte) => {
        acc[cohorte.id] = (cohorte.institutos ?? []).map((instituto) => ({
          id: instituto.id,
          nombre: instituto.nombre,
        }));
        return acc;
      },
      {}
    );
  }, [visibleCohortes]);

  const getInscripciones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<InscripcionesListApiResponse>(`/inscripciones?${queryString}`);
      const { inscriptos, total: totalItems } = response.data.data;
      setRows(inscriptos);
      setTotal(totalItems);
    } catch {
      appToast.error("No se pudieron cargar las inscripciones");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  const getCohortes = useCallback(async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: CohorteOption[] | { cohortes: CohorteOption[] };
      }>("/cohortes");

      const data = response.data.data;
      const nextCohortes = Array.isArray(data) ? data : (data?.cohortes ?? []);
      setCohortes(nextCohortes);
    } catch {
      appToast.error("No se pudieron cargar las cohortes");
    }
  }, []);

  useEffect(() => {
    getInscripciones();
  }, [getInscripciones]);

  useEffect(() => {
    getCohortes();
  }, [getCohortes]);

  useEffect(() => {
    if (!isReferente || !cohorteId) return;
    const exists = visibleCohortes.some((item) => String(item.id) === cohorteId);
    if (!exists) {
      setCohorteId("");
      setPage(1);
    }
  }, [isReferente, cohorteId, visibleCohortes]);

  const setRowSaving = (id: number, saving: boolean) => {
    setSavingRowIds((prev) => {
      if (saving) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }

      return prev.filter((rowId) => rowId !== id);
    });
  };

  const handleEstadoChange = async (id: number, newEstado: EstadoInscripcionPrivada) => {
    const previous = rows.find((row) => row.id === id)?.estado;
    if (!previous || previous === newEstado) return;

    setRows((prev) => updateItemInArray(prev, id, "estado", newEstado));
    setRowSaving(id, true);

    try {
      await api.patch(`/inscripciones/${id}/estado`, { estado: newEstado });
    } catch {
      setRows((prev) => updateItemInArray(prev, id, "estado", previous));
      appToast.error("No se pudo actualizar el estado");
    } finally {
      setRowSaving(id, false);
    }
  };

  const handleDocumentacionChange = async (
    id: number,
    newDocumentacion: DocumentacionInscripcion
  ) => {
    const previous = rows.find((row) => row.id === id)?.documentacion;
    if (!previous || previous === newDocumentacion) return;

    setRows((prev) => updateItemInArray(prev, id, "documentacion", newDocumentacion));
    setRowSaving(id, true);

    try {
      await api.patch(`/inscripciones/${id}/documentacion`, {
        documentacion: newDocumentacion,
      });
    } catch {
      setRows((prev) => updateItemInArray(prev, id, "documentacion", previous));
      appToast.error("No se pudo actualizar la documentacion");
    } finally {
      setRowSaving(id, false);
    }
  };

  const handleInstitutoChange = async (id: number, newInstitutoId: number | null) => {
    const row = rows.find((item) => item.id === id);
    if (!row) return;
    if (row.institutoId === newInstitutoId) return;

    const previousInstitutoId = row.institutoId;
    const previousInstituto = row.instituto;
    const allowedInstitutos = allowedInstitutosByCohorte[row.cohorteId] ?? [];
    const nextInstituto = newInstitutoId
      ? allowedInstitutos.find((item) => item.id === newInstitutoId) ?? null
      : null;

    setRows((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              institutoId: newInstitutoId,
              instituto: nextInstituto,
            }
          : item
      )
    );
    setRowSaving(id, true);

    try {
      await api.patch(`/inscripciones/${id}`, { institutoId: newInstitutoId });
    } catch {
      setRows((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                institutoId: previousInstitutoId,
                instituto: previousInstituto,
              }
            : item
        )
      );
      appToast.error("No se pudo actualizar el instituto");
    } finally {
      setRowSaving(id, false);
    }
  };

  const resolveRegionIdFromDetalle = (
    datosFormulario: Record<string, unknown> | null,
    distritoToRegion: Record<number, number | null>
  ): number | null => {
    if (!datosFormulario) return null;

    const getNumber = (value: unknown): number | null => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const regionCandidateKeys = ["regionId", "region_id", "region", "region_residencia"];
    for (const key of regionCandidateKeys) {
      const region = getNumber(datosFormulario[key]);
      if (region !== null) return region;
    }

    const distritoCandidateKeys = [
      "distritoId",
      "distrito_id",
      "distrito",
      "distrito_residencia",
    ];
    for (const key of distritoCandidateKeys) {
      const distritoId = getNumber(datosFormulario[key]);
      if (distritoId !== null && distritoToRegion[distritoId] !== undefined) {
        return distritoToRegion[distritoId];
      }
    }

    return null;
  };

  const buildAutoAssignments = (
    candidates: Array<{
      inscriptoId: number;
      nombre: string;
      apellido: string;
      dni: string;
      regionId: number | null;
    }>,
    institutos: InstitutoOption[]
  ): MassAssignmentDraft[] => {
    if (institutos.length === 0) return [];

    const sortedCandidates = [...candidates].sort((a, b) => {
      const regionA = a.regionId ?? Number.MAX_SAFE_INTEGER;
      const regionB = b.regionId ?? Number.MAX_SAFE_INTEGER;
      if (regionA !== regionB) return regionA - regionB;
      return a.apellido.localeCompare(b.apellido);
    });

    const total = sortedCandidates.length;
    const countInstitutos = institutos.length;
    const base = Math.floor(total / countInstitutos);
    const remainder = total % countInstitutos;

    const capacities = institutos.map((instituto, idx) => ({
      instituto,
      limit: base + (idx < remainder ? 1 : 0),
      assigned: 0,
    }));

    const assignments = new Map<number, number | null>();

    const assignCandidate = (
      inscripto: (typeof sortedCandidates)[number],
      pool: typeof capacities
    ): boolean => {
      const available = pool.filter((entry) => entry.assigned < entry.limit);
      if (available.length === 0) return false;

      available.sort((a, b) => {
        if (a.assigned !== b.assigned) return a.assigned - b.assigned;
        return a.instituto.id - b.instituto.id;
      });

      const selected = available[0];
      selected.assigned += 1;
      assignments.set(inscripto.inscriptoId, selected.instituto.id);
      return true;
    };

    for (const inscripto of sortedCandidates) {
      const regionPool =
        inscripto.regionId === null
          ? []
          : capacities.filter(
              (entry) =>
                entry.instituto.regionId === inscripto.regionId &&
                entry.assigned < entry.limit
            );

      if (regionPool.length > 0) {
        assignCandidate(inscripto, regionPool);
        continue;
      }

      assignCandidate(inscripto, capacities);
    }

    return sortedCandidates.map((inscripto) => ({
      inscriptoId: inscripto.inscriptoId,
      institutoId: assignments.get(inscripto.inscriptoId) ?? null,
      nombre: inscripto.nombre,
      apellido: inscripto.apellido,
      dni: inscripto.dni,
      regionId: inscripto.regionId,
    }));
  };

  const handleBuildMassAsignacion = async () => {
    if (!isAdmin) return;
    if (!cohorteId) {
      appToast.error("Selecciona una cohorte para generar la asignacion masiva");
      return;
    }

    setBuildingMassAssign(true);
    try {
      const cohortesMap = cohortes.reduce<Record<number, CohorteOption>>((acc, cohorte) => {
        acc[cohorte.id] = cohorte;
        return acc;
      }, {});
      const selectedCohorte = cohortesMap[Number(cohorteId)];
      const allowedInstitutos = selectedCohorte?.institutos ?? [];
      if (allowedInstitutos.length === 0) {
        appToast.error("La cohorte no tiene institutos asignados");
        return;
      }

      const [institutosRes, distritosRes] = await Promise.all([
        api.get<{ success: boolean; data: { id: number; nombre: string; regionId: number | null }[] }>(
          "/institutos"
        ),
        api.get<{ success: boolean; data: DistritoRef[] }>("/distritos"),
      ]);

      const institutosMeta = institutosRes.data.data || [];
      const distritoToRegion = (distritosRes.data.data || []).reduce<
        Record<number, number | null>
      >((acc, distrito) => {
        acc[distrito.id] = distrito.regionId ?? null;
        return acc;
      }, {});

      const allowedInstitutoOptions: InstitutoOption[] = allowedInstitutos.map((instituto) => {
        const meta = institutosMeta.find((m) => m.id === instituto.id);
        return {
          id: instituto.id,
          nombre: instituto.nombre,
          regionId: meta?.regionId ?? null,
        };
      });

      const allRows: InscripcionListadoItem[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await api.get<InscripcionesListApiResponse>("/inscripciones", {
          params: {
            page: currentPage,
            limit: 100,
            cohorteId,
          },
        });
        const data = response.data.data;
        allRows.push(...data.inscriptos);
        totalPages = data.totalPages || 1;
        currentPage += 1;
      } while (currentPage <= totalPages);

      const candidatesBase = allRows.filter((item) => item.estado !== "RECHAZADA");
      if (candidatesBase.length === 0) {
        appToast.error("No hay inscriptos elegibles para asignacion masiva");
        return;
      }

      const candidateDetails = await Promise.all(
        candidatesBase.map(async (item) => {
          const detailRes = await api.get<InscripcionDetalleApiResponse>(
            `/inscripciones/${item.id}`
          );
          const regionId = resolveRegionIdFromDetalle(
            detailRes.data.data.datosFormulario,
            distritoToRegion
          );

          return {
            inscriptoId: item.id,
            nombre: item.nombre,
            apellido: item.apellido,
            dni: item.dni,
            regionId,
          };
        })
      );

      const draft = buildAutoAssignments(candidateDetails, allowedInstitutoOptions);
      setMassAssignments(draft);
      setMassAssignInstitutos(allowedInstitutoOptions);
      setOpenMassAssignDialog(true);
    } catch {
      appToast.error("No se pudo generar la asignacion masiva");
    } finally {
      setBuildingMassAssign(false);
    }
  };

  const handleConfirmMassAsignacion = async () => {
    setSavingMassAssign(true);
    try {
      await api.patch("/inscripciones/institutos/asignacion-masiva", {
        asignaciones: massAssignments.map((item) => ({
          inscriptoId: item.inscriptoId,
          institutoId: item.institutoId,
        })),
      });
      appToast.success("Asignacion masiva aplicada");
      setOpenMassAssignDialog(false);
      setMassAssignments([]);
      await getInscripciones();
    } catch {
      appToast.error("No se pudo aplicar la asignacion masiva");
    } finally {
      setSavingMassAssign(false);
    }
  };

  const assignedCountByInstituto = useMemo(() => {
    return massAssignments.reduce<Record<number, number>>((acc, item) => {
      if (item.institutoId === null) return acc;
      acc[item.institutoId] = (acc[item.institutoId] || 0) + 1;
      return acc;
    }, {});
  }, [massAssignments]);

  const handleFilterChange = (setter: (value: string) => void) => (event: SelectChangeEvent) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Inscripciones ({total})
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={handleBuildMassAsignacion}
            disabled={buildingMassAssign}
          >
            {buildingMassAssign ? "Generando..." : "Asignar institutos masivamente"}
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="cohorte-filter-label">Cohorte</InputLabel>
          <Select
            labelId="cohorte-filter-label"
            label="Cohorte"
            value={cohorteId}
            onChange={handleFilterChange(setCohorteId)}
          >
            <MenuItem value="">Todas</MenuItem>
            {visibleCohortes.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.nombre} ({item.anio})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="estado-filter-label">Estado</InputLabel>
          <Select
            labelId="estado-filter-label"
            label="Estado"
            value={estado}
            onChange={handleFilterChange(setEstado)}
          >
            <MenuItem value="">Todos</MenuItem>
            {ESTADOS.map((item) => (
              <MenuItem key={item} value={item}>
                {getEstadoInscripcionPrivadaMeta(item).label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="documentacion-filter-label">Documentacion</InputLabel>
          <Select
            labelId="documentacion-filter-label"
            label="Documentacion"
            value={documentacion}
            onChange={handleFilterChange(setDocumentacion)}
          >
            <MenuItem value="">Todas</MenuItem>
            {DOCUMENTACIONES.map((item) => (
              <MenuItem key={item} value={item}>
                {getDocumentacionCursanteMeta(item).label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Nombre, apellido, DNI o email"
          sx={{ minWidth: 280 }}
        />
      </Stack>

      <InscripcionesTable
        rows={sortedRows}
        allowedInstitutosByCohorte={allowedInstitutosByCohorte}
        isAdmin={isAdmin}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        savingRowIds={savingRowIds}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onEstadoChange={handleEstadoChange}
        onDocumentacionChange={handleDocumentacionChange}
        onInstitutoChange={handleInstitutoChange}
      />

      <Dialog
        open={openMassAssignDialog}
        onClose={() => setOpenMassAssignDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Asignacion masiva de institutos</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Revisa la asignacion sugerida. Puedes modificar cualquier instituto antes de
              confirmar.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {massAssignInstitutos.map((instituto) => (
                <Typography key={instituto.id} variant="body2">
                  {instituto.nombre}: {assignedCountByInstituto[instituto.id] || 0}
                </Typography>
              ))}
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Apellido y nombre</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Instituto asignado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {massAssignments.map((item) => (
                  <TableRow key={item.inscriptoId}>
                    <TableCell>
                      {item.apellido}, {item.nombre}
                    </TableCell>
                    <TableCell>{item.dni}</TableCell>
                    <TableCell>
                      {item.regionId !== null && item.regionId !== undefined
                        ? `Region ${item.regionId}`
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ minWidth: 280 }}>
                      <Select
                        size="small"
                        fullWidth
                        value={item.institutoId ? String(item.institutoId) : ""}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const nextId = raw === "" ? null : Number(raw);
                          setMassAssignments((prev) =>
                            prev.map((row) =>
                              row.inscriptoId === item.inscriptoId
                                ? { ...row, institutoId: nextId }
                                : row
                            )
                          );
                        }}
                      >
                        <MenuItem value="">Sin instituto</MenuItem>
                        {massAssignInstitutos.map((instituto) => (
                          <MenuItem key={instituto.id} value={String(instituto.id)}>
                            {instituto.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMassAssignDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmMassAsignacion}
            variant="contained"
            disabled={savingMassAssign || massAssignments.length === 0}
          >
            {savingMassAssign ? "Guardando..." : "Confirmar asignacion"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
