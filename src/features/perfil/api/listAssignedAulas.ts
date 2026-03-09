import { listAulas } from "@/features/aulas/api";

export async function listAssignedAulas() {
  return listAulas();
}
