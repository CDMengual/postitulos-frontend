import { useEffect, useState } from "react";

/**
 * Hook para retrasar la actualización de un valor (debounce).
 *
 * @param value Valor a controlar.
 * @param delay Tiempo de espera en milisegundos.
 * @returns Valor actualizado solo después del retraso.
 *
 * 🧠 Ejemplo:
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 *
 * Esto solo se ejecuta 0.5s después de dejar de tipear
 * useEffect(() => {
 *   if (debouncedSearch.length > 2) fetchData(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
