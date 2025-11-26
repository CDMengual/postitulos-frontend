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

    if (typeof window !== "undefined") {
      switch (status) {
        case 401:
          // Token inválido o expirado
          window.location.href = "/auth/login";
          break;
        case 403:
          // Usuario autenticado pero sin permisos
          window.location.href = "/gestion/forbidden";
          break;
        case 404:
          // Recurso no encontrado (por ejemplo aula inexistente)
          window.location.href = "/gestion/not-found";
          break;
        default:
          break; // otros errores se manejarán localmente
      }
    }

    return Promise.reject(error);
  }
);

export default api;
