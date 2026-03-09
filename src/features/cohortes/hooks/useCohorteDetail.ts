"use client";

import { useCallback, useEffect, useState } from "react";
import { getCohorte } from "@/features/cohortes/api";
import { Cohorte } from "@/features/cohortes/model/types";
import { Instituto } from "@/features/institutos";

export function useCohorteDetail(id?: string) {
  const [cohorte, setCohorte] = useState<Cohorte | null>(null);
  const [institutosMeta, setInstitutosMeta] = useState<Record<number, Instituto>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const nextData = await getCohorte(id);
      setCohorte(nextData.cohorte);
      setInstitutosMeta(nextData.institutosMeta);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    cohorte,
    institutosMeta,
    loading,
    refresh,
  };
}
