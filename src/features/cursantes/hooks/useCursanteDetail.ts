"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { assignCursanteAula, getCursante, listAssignableAulas } from "@/features/cursantes/api";
import { Cursante } from "@/features/cursantes/model/types";
import { Aula } from "@/features/aulas/model/types";
import { appToast } from "@/shared/lib/toast";
import { getEstadoInscripcionCursante } from "@/shared/lib/inscripcionEstado";

export function useCursanteDetail(cursanteId: number) {
  const [cursante, setCursante] = useState<Cursante | null>(null);
  const [loading, setLoading] = useState(true);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);

  const refresh = useCallback(async () => {
    if (Number.isNaN(cursanteId)) return;

    try {
      setLoading(true);
      const nextCursante = await getCursante(cursanteId);
      setCursante(nextCursante);
    } catch {
      appToast.error();
    } finally {
      setLoading(false);
    }
  }, [cursanteId]);

  const loadAulas = useCallback(async () => {
    try {
      setLoadingAulas(true);
      const nextAulas = await listAssignableAulas();
      setAulas(nextAulas);
    } catch {
      appToast.error("No se pudieron cargar las aulas");
    } finally {
      setLoadingAulas(false);
    }
  }, []);

  const assignAula = useCallback(
    async (aulaId: number) => {
      if (Number.isNaN(cursanteId)) return;

      await assignCursanteAula(cursanteId, aulaId);
      appToast.success("Aula asignada correctamente");
      await refresh();
    },
    [cursanteId, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const assignedAulaCodes = useMemo(
    () =>
      (cursante?.inscripciones ?? [])
        .map((inscripcion) => inscripcion.aula?.codigo ?? "")
        .filter((code) => code.trim().length > 0),
    [cursante]
  );

  const estadoInscripcionActual = useMemo(
    () => (cursante ? getEstadoInscripcionCursante(cursante) : "INSCRIPTO"),
    [cursante]
  );

  return {
    cursante,
    aulas,
    loading,
    loadingAulas,
    assignedAulaCodes,
    estadoInscripcionActual,
    refresh,
    loadAulas,
    assignAula,
  };
}
