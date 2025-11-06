"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("auth_token");
    router.replace(token ? "/gestion" : "/auth/login");
  }, [router]);

  return null;
}
