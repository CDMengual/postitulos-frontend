"use client";

import { useCallback, useEffect, useState } from "react";
import { getPostitulo } from "@/features/postitulos/api";
import { Postitulo } from "@/features/postitulos/model/types";

export function usePostituloDetail(id?: string) {
  const [postitulo, setPostitulo] = useState<Postitulo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const nextPostitulo = await getPostitulo(id);
      setPostitulo(nextPostitulo);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    postitulo,
    loading,
    refresh,
  };
}
