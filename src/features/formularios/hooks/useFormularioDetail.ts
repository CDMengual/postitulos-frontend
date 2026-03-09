"use client";

import { useCallback, useEffect, useState } from "react";
import { getFormulario } from "@/features/formularios/api";
import { Formulario } from "@/features/formularios/model/types";

export function useFormularioDetail(id?: string) {
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const nextFormulario = await getFormulario(id);
      setFormulario(nextFormulario);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    formulario,
    loading,
    refresh,
  };
}
