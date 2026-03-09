"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteAula, listAulas, listPostitulos, ListAulasFilters } from "@/features/aulas/api";
import { Aula } from "@/features/aulas/model/types";
import { Postitulo } from "@/features/postitulos";

export function useAulas(filters?: ListAulasFilters) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextAulas = await listAulas(filters);
      setAulas(nextAulas);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshPostitulos = useCallback(async () => {
    const nextPostitulos = await listPostitulos();
    setPostitulos(nextPostitulos);
  }, []);

  const removeAula = useCallback(
    async (id: number) => {
      await deleteAula(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void refreshPostitulos();
  }, [refreshPostitulos]);

  return {
    aulas,
    postitulos,
    loading,
    refresh,
    removeAula,
  };
}
