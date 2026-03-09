"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/shared/components/providers/LoadingProvider";

export default function RouteLoadingListener() {
  const pathname = usePathname();
  const { setLoading } = useLoading();

  useEffect(() => {
    // Se activa apenas cambia la ruta
    setLoading(true);

    // Pequeño delay para que se note la carga
    const timeout = setTimeout(() => setLoading(false), 400);

    return () => clearTimeout(timeout);
  }, [pathname, setLoading]);

  return null;
}
