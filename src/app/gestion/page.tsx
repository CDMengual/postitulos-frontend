"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/providers/UserProvider";
import { CircularProgress, Stack } from "@mui/material";

export default function GestionIndex() {
  const { user, loading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }
    switch (user.rol) {
      case "ADMIN":
        router.replace("/gestion/postitulos");
        break;
      case "REFERENTE":
        router.replace("/gestion/postitulos");
        break;
      default:
        router.replace("/auth/login");
        break;
    }
  }, [user, loading, router]);

  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Stack>
  );
}
