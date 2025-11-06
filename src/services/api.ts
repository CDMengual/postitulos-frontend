import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envía/recibe cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
