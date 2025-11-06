// src/constants/postitulosColors.ts

export const postituloColors: Record<string, string> = {
  EA: "#4caf50", // Educación Ambiental
  IB: "#1976d2", // Identidades bonaerenses
  EI: "#f57c00", // Enseñanza con imágenes
  EyCD: "#c2185b", // Escuelas y cultura digital
  ESI: "#9c27b0", // Diplomatura en esi
  EyCPI: "#009688", // Educación inicial
  AACC: "#673ab7", // Actualización Académica en Ciencias de la Computación
  EyAJA: "#e91e63", // Adultos y Jóvenes Adultos
  DEFAULT: "#9e9e9e", // fallback color
};

// Helper para obtener color seguro
export function getPostituloColor(code?: string): string {
  if (!code) return postituloColors.DEFAULT;
  return postituloColors[code] || postituloColors.DEFAULT;
}
