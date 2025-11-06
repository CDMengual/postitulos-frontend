export type UserRole = "ADMIN" | "REFERENTE";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string | null;
  rol: UserRole;
  institutoId?: number | null;
  instituto?: {
    id: number;
    nombre: string;
    distrito?: {
      id: number;
      nombre: string;
      region?: {
        id: number;
        nombre: string;
      } | null;
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}
