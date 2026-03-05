// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url ?? "";
    const appCode: string | undefined = error.response?.data?.error?.details?.appCode;
    const isAuthLoginRequest = requestUrl.includes("/auth/login");
    const isPublicInscripcionCreateRequest =
      requestUrl.includes("/public/cohortes/") && requestUrl.includes("/inscripciones");
    const isDuplicatedInscripcionDni =
      appCode === "INSCRIPCION_DUPLICADA_COHORTE_DNI";

    if (typeof window !== "undefined") {
      switch (status) {
        case 401:
          // Token invalido o expirado
          if (!isAuthLoginRequest) {
            window.location.href = "/auth/login";
          }
          break;
        case 403:
          // Usuario autenticado pero sin permisos
          window.location.href = "/gestion/forbidden";
          break;
        case 409:
          // Permitir manejo local de conflictos conocidos (ej: inscripcion duplicada).
          if (!isPublicInscripcionCreateRequest && !isDuplicatedInscripcionDni) {
            window.location.href = "/gestion/not-found";
          }
          break;
        default:
          break; // otros errores se manejaran localmente
      }
    }

    return Promise.reject(error);
  }
);

export default api;
