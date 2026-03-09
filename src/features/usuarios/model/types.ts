export type UserRole = "ADMIN" | "REFERENTE";

export interface UserInstitute {
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
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string | null;
  rol: UserRole;
  institutoId?: number | null;
  instituto?: UserInstitute | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioFormData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  rol: UserRole;
  password?: string;
  institutoId?: number | null;
}

export interface UsuarioFormInstitutoOption {
  id: number;
  nombre: string;
}
