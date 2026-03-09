"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listCohortes } from "@/features/cohortes/api";
import { Cohorte } from "@/features/cohortes/model/types";
import { listDistritos } from "@/features/formularios/api";
import {
  applyMassInscripcionInstitutoAssignment,
  getInscripcion,
  listInscripcionInstitutos,
  listInscripciones,
  updateInscripcionDocumentacion,
  updateInscripcionEstado,
  updateInscripcionInstituto,
} from "@/features/inscripciones/api";
import {
  DocumentacionInscripcion,
  EstadoInscripcionPrivada,
  InscripcionListadoItem,
  InstitutoOption,
  ListInscripcionesFilters,
  MassAssignmentDraft,
} from "@/features/inscripciones/model/types";
import { User } from "@/features/usuarios/model/types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { updateItemInArray } from "@/shared/lib/localUpdate";
import { appToast } from "@/shared/lib/toast";

type CohorteOption = Pick<Cohorte, "id" | "nombre" | "anio" | "institutos">;

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

  const distritoCandidateKeys = ["distritoId", "distrito_id", "distrito", "distrito_residencia"];
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
  const base = Math.floor(total / institutos.length);
  const remainder = total % institutos.length;

  const capacities = institutos.map((instituto, index) => ({
    instituto,
    limit: base + (index < remainder ? 1 : 0),
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
              entry.instituto.regionId === inscripto.regionId && entry.assigned < entry.limit
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

interface UseInscripcionesOptions {
  user: User | null;
  initialCohorteId?: string;
}

export function useInscripciones({ user, initialCohorteId = "" }: UseInscripcionesOptions) {
  const [rows, setRows] = useState<InscripcionListadoItem[]>([]);
  const [cohortes, setCohortes] = useState<CohorteOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [savingRowIds, setSavingRowIds] = useState<number[]>([]);
  const [buildingMassAssign, setBuildingMassAssign] = useState(false);
  const [savingMassAssign, setSavingMassAssign] = useState(false);
  const [massAssignments, setMassAssignments] = useState<MassAssignmentDraft[]>([]);
  const [massAssignInstitutos, setMassAssignInstitutos] = useState<InstitutoOption[]>([]);
  const [cohorteId, setCohorteId] = useState(initialCohorteId);
  const [estado, setEstado] = useState("");
  const [documentacion, setDocumentacion] = useState("");
  const [search, setSearch] = useState("");

  const isAdmin = user?.rol === "ADMIN";
  const isReferente = user?.rol === "REFERENTE";
  const debouncedSearch = useDebounce(search, 400);

  const listFilters = useMemo<ListInscripcionesFilters>(
    () => ({
      page,
      limit: pageSize,
      cohorteId,
      estado,
      documentacion,
      search: debouncedSearch,
    }),
    [page, pageSize, cohorteId, estado, documentacion, debouncedSearch]
  );

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

  const setRowSaving = useCallback((id: number, saving: boolean) => {
    setSavingRowIds((prev) => {
      if (saving) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }

      return prev.filter((rowId) => rowId !== id);
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!listFilters.cohorteId) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listInscripciones(listFilters);
      setRows(data.inscriptos);
      setTotal(data.total);
    } catch {
      appToast.error("No se pudieron cargar las inscripciones");
    } finally {
      setLoading(false);
    }
  }, [listFilters]);

  const refreshCohortes = useCallback(async () => {
    try {
      const nextCohortes = await listCohortes();
      setCohortes(nextCohortes);
    } catch {
      appToast.error("No se pudieron cargar las cohortes");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void refreshCohortes();
  }, [refreshCohortes]);

  useEffect(() => {
    if (!isReferente || !cohorteId) return;
    const exists = visibleCohortes.some((item) => String(item.id) === cohorteId);
    if (!exists) {
      setCohorteId("");
      setPage(1);
    }
  }, [isReferente, cohorteId, visibleCohortes]);

  const handleEstadoChange = useCallback(
    async (id: number, newEstado: EstadoInscripcionPrivada) => {
      const previous = rows.find((row) => row.id === id)?.estado;
      if (!previous || previous === newEstado) return;

      setRows((prev) => updateItemInArray(prev, id, "estado", newEstado));
      setRowSaving(id, true);

      try {
        await updateInscripcionEstado(id, newEstado);
      } catch {
        setRows((prev) => updateItemInArray(prev, id, "estado", previous));
        appToast.error("No se pudo actualizar el estado");
      } finally {
        setRowSaving(id, false);
      }
    },
    [rows, setRowSaving]
  );

  const handleDocumentacionChange = useCallback(
    async (id: number, newDocumentacion: DocumentacionInscripcion) => {
      const previous = rows.find((row) => row.id === id)?.documentacion;
      if (!previous || previous === newDocumentacion) return;

      setRows((prev) => updateItemInArray(prev, id, "documentacion", newDocumentacion));
      setRowSaving(id, true);

      try {
        await updateInscripcionDocumentacion(id, newDocumentacion);
      } catch {
        setRows((prev) => updateItemInArray(prev, id, "documentacion", previous));
        appToast.error("No se pudo actualizar la documentacion");
      } finally {
        setRowSaving(id, false);
      }
    },
    [rows, setRowSaving]
  );

  const handleInstitutoChange = useCallback(
    async (id: number, newInstitutoId: number | null) => {
      const row = rows.find((item) => item.id === id);
      if (!row || row.institutoId === newInstitutoId) return;

      const previousInstitutoId = row.institutoId;
      const previousInstituto = row.instituto;
      const allowedInstitutos = allowedInstitutosByCohorte[row.cohorteId] ?? [];
      const nextInstituto = newInstitutoId
        ? (allowedInstitutos.find((item) => item.id === newInstitutoId) ?? null)
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
        await updateInscripcionInstituto(id, newInstitutoId);
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
    },
    [allowedInstitutosByCohorte, rows, setRowSaving]
  );

  const buildMassAssignmentDraft = useCallback(async () => {
    if (!isAdmin) return false;
    if (!cohorteId) {
      appToast.error("Selecciona una cohorte para generar la asignacion masiva");
      return false;
    }

    setBuildingMassAssign(true);
    try {
      const selectedCohorte = cohortes.find((item) => item.id === Number(cohorteId));
      const allowedInstitutos = selectedCohorte?.institutos ?? [];
      if (allowedInstitutos.length === 0) {
        appToast.error("La cohorte no tiene institutos asignados");
        return false;
      }

      const [institutosMeta, distritos] = await Promise.all([
        listInscripcionInstitutos(),
        listDistritos(),
      ]);
      const distritoToRegion = distritos.reduce<Record<number, number | null>>((acc, distrito) => {
        acc[distrito.id] = distrito.regionId ?? null;
        return acc;
      }, {});

      const allowedInstitutoOptions: InstitutoOption[] = allowedInstitutos.map((instituto) => {
        const meta = institutosMeta.find((item) => item.id === instituto.id);
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
        const data = await listInscripciones({
          page: currentPage,
          limit: 100,
          cohorteId,
        });
        allRows.push(...data.inscriptos);
        totalPages = data.totalPages || 1;
        currentPage += 1;
      } while (currentPage <= totalPages);

      const candidatesBase = allRows.filter((item) => item.estado !== "RECHAZADA");
      if (candidatesBase.length === 0) {
        appToast.error("No hay inscriptos elegibles para asignacion masiva");
        return false;
      }

      const candidateDetails = await Promise.all(
        candidatesBase.map(async (item) => {
          const detail = await getInscripcion(item.id);
          const regionId = resolveRegionIdFromDetalle(detail.datosFormulario, distritoToRegion);

          return {
            inscriptoId: item.id,
            nombre: item.nombre,
            apellido: item.apellido,
            dni: item.dni,
            regionId,
          };
        })
      );

      setMassAssignments(buildAutoAssignments(candidateDetails, allowedInstitutoOptions));
      setMassAssignInstitutos(allowedInstitutoOptions);
      return true;
    } catch {
      appToast.error("No se pudo generar la asignacion masiva");
      return false;
    } finally {
      setBuildingMassAssign(false);
    }
  }, [cohorteId, cohortes, isAdmin]);

  const confirmMassAssignment = useCallback(async () => {
    setSavingMassAssign(true);
    try {
      await applyMassInscripcionInstitutoAssignment(
        massAssignments.map((item) => ({
          inscriptoId: item.inscriptoId,
          institutoId: item.institutoId,
        }))
      );
      appToast.success("Asignacion masiva aplicada");
      setMassAssignments([]);
      await refresh();
      return true;
    } catch {
      appToast.error("No se pudo aplicar la asignacion masiva");
      return false;
    } finally {
      setSavingMassAssign(false);
    }
  }, [massAssignments, refresh]);

  const assignedCountByInstituto = useMemo(() => {
    return massAssignments.reduce<Record<number, number>>((acc, item) => {
      if (item.institutoId === null) return acc;
      acc[item.institutoId] = (acc[item.institutoId] || 0) + 1;
      return acc;
    }, {});
  }, [massAssignments]);

  return {
    rows: sortedRows,
    total,
    page,
    pageSize,
    loading,
    savingRowIds,
    cohortes: visibleCohortes,
    cohorteId,
    estado,
    documentacion,
    search,
    isAdmin,
    allowedInstitutosByCohorte,
    buildingMassAssign,
    savingMassAssign,
    massAssignments,
    massAssignInstitutos,
    assignedCountByInstituto,
    setPage,
    setPageSize,
    setCohorteId,
    setEstado,
    setDocumentacion,
    setSearch,
    setMassAssignments,
    refresh,
    handleEstadoChange,
    handleDocumentacionChange,
    handleInstitutoChange,
    buildMassAssignmentDraft,
    confirmMassAssignment,
  };
}
