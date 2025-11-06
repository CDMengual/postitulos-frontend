import {
  Home,
  School,
  People,
  Description,
  Domain,
  CoPresent,
} from "@mui/icons-material";

import { UserRole } from "@/types/user";

export const menuItems: Array<{
  label: string;
  path: string;
  roles: UserRole[];
  icon: React.ElementType;
}> = [
  {
    label: "Inicio",
    path: "/gestion",
    roles: ["ADMIN", "REFERENTE"],
    icon: Home,
  },
  {
    label: "Aulas",
    path: "/gestion/aulas",
    roles: ["ADMIN", "REFERENTE"],
    icon: CoPresent,
  },
  {
    label: "Postítulos",
    path: "/gestion/postitulos",
    roles: ["ADMIN", "REFERENTE"],
    icon: School,
  },
  {
    label: "Usuarios",
    path: "/gestion/usuarios",
    roles: ["ADMIN"],
    icon: People,
  },
  {
    label: "Institutos",
    path: "/gestion/institutos",
    roles: ["ADMIN"],
    icon: Domain,
  },
  {
    label: "Formularios",
    path: "/gestion/formularios",
    roles: ["ADMIN"],
    icon: Description,
  },
];
