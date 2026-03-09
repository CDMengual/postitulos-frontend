"use client";

import { useCallback, useEffect, useState } from "react";
import { deletePostitulo, listPostitulos } from "@/features/postitulos/api";
import { Postitulo } from "@/features/postitulos/model/types";

export function usePostitulos() {
  const [postitulos, setPostitulos] = useState<Postitulo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextPostitulos = await listPostitulos();
      setPostitulos(nextPostitulos);
    } finally {
      setLoading(false);
    }
  }, []);

  const removePostitulo = useCallback(
    async (id: number) => {
      await deletePostitulo(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    postitulos,
    loading,
    refresh,
    removePostitulo,
  };
}
