"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listCohortesEnInscripcion } from "@/features/formularios/api";
import { CohortePublica } from "@/features/cohortes/model/types";

export function useCohortesEnInscripcion() {
  const [cohortes, setCohortes] = useState<CohortePublica[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextCohortes = await listCohortesEnInscripcion();
      setCohortes(nextCohortes);
      return nextCohortes;
    } catch {
      setCohortes([]);
      setError("No se pudieron cargar las cohortes disponibles.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedCohorte = useMemo(
    () => cohortes.find((cohorte) => String(cohorte.id) === selectedId) ?? null,
    [cohortes, selectedId]
  );

  return {
    cohortes,
    selectedId,
    selectedCohorte,
    loading,
    error,
    setSelectedId,
    refresh,
  };
}
