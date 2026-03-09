"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteUsuario, listUsuarios } from "@/features/usuarios/api";
import { User } from "@/features/usuarios/model/types";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextUsuarios = await listUsuarios();
      setUsuarios(nextUsuarios);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUsuario = useCallback(
    async (id: number) => {
      await deleteUsuario(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    usuarios,
    loading,
    refresh,
    removeUsuario,
  };
}
