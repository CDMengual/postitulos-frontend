"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteFormulario, listFormularios } from "@/features/formularios/api";
import { Formulario } from "@/features/formularios/model/types";

export function useFormularios() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextFormularios = await listFormularios();
      setFormularios(nextFormularios);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFormulario = useCallback(
    async (id: number) => {
      await deleteFormulario(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    formularios,
    loading,
    removeFormulario,
    refresh,
  };
}
