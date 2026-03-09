"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteCursante, listCursantes } from "@/features/cursantes/api";
import { Cursante } from "@/features/cursantes/model/types";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function useCursantes() {
  const [cursantes, setCursantes] = useState<Cursante[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 350);

  const refresh = useCallback(
    async (nextPage = page, nextPageSize = pageSize, nextSearch = debouncedSearch) => {
      setLoading(true);
      try {
        const data = await listCursantes(nextPage, nextPageSize, nextSearch);
        setCursantes(data.cursantes);
        setTotal(data.total);
        setPage(nextPage);
        setPageSize(nextPageSize);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, page, pageSize]
  );

  const removeCursante = useCallback(
    async (id: number) => {
      await deleteCursante(id);
      await refresh(page, pageSize, debouncedSearch);
    },
    [debouncedSearch, page, pageSize, refresh]
  );

  useEffect(() => {
    void refresh(1, pageSize, debouncedSearch);
  }, [debouncedSearch, pageSize, refresh]);

  return {
    cursantes,
    total,
    page,
    pageSize,
    search,
    loading,
    setSearch,
    refresh,
    removeCursante,
  };
}
