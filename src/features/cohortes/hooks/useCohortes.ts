"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteCohorte, listCohortes, ListCohortesFilters } from "@/features/cohortes/api";
import { Cohorte } from "@/features/cohortes/model/types";

export function useCohortes(filters?: ListCohortesFilters) {
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextCohortes = await listCohortes(filters);
      setCohortes(nextCohortes);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const removeCohorte = useCallback(
    async (id: number) => {
      await deleteCohorte(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    cohortes,
    loading,
    refresh,
    removeCohorte,
  };
}
