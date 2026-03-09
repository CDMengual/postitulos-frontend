"use client";

import { useCallback, useEffect, useState } from "react";
import { getAula } from "@/features/aulas/api";
import { Aula } from "@/features/aulas/model/types";

export function useAulaDetail(id?: number) {
  const [aula, setAula] = useState<Aula | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;

    setLoading(true);
    try {
      const nextAula = await getAula(id);
      setAula(nextAula);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    aula,
    loading,
    refresh,
  };
}
