"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteInstituto, listInstitutos, resolveEditableInstituto } from "@/features/institutos/api";
import { EditableInstituto } from "@/features/institutos/model/types";

export function useInstitutos() {
  const [institutos, setInstitutos] = useState<EditableInstituto[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextInstitutos = await listInstitutos();
      setInstitutos(nextInstitutos);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeInstituto = useCallback(
    async (id: number) => {
      await deleteInstituto(id);
      await refresh();
    },
    [refresh]
  );

  const getEditableInstituto = useCallback(async (instituto: EditableInstituto) => {
    return resolveEditableInstituto(instituto);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    institutos,
    loading,
    refresh,
    removeInstituto,
    getEditableInstituto,
  };
}
