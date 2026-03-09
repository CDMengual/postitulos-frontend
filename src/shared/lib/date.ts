// src/utils/date.ts

export type DateFormat =
  | "short" // 16/02/2026
  | "medium" // 16 feb 2026
  | "long"; // 16 de febrero de 2026

const FORMAT_PRESETS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { day: "2-digit", month: "2-digit", year: "numeric" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  long: { day: "numeric", month: "long", year: "numeric" },
};

/**
 * Formatea una fecha en base a presets o overrides manuales.
 *
 * @param isoDate string | Date — fecha ISO o Date
 * @param format DateFormat — preset de formato ("short", "medium", "long")
 * @param opts Intl.DateTimeFormatOptions — overrides opcionales
 * @param locale string — "es-AR" por defecto
 */
export function formatDate(
  isoDate: string | Date,
  format: DateFormat = "short",
  opts: Intl.DateTimeFormatOptions = {},
  locale: string = "es-AR"
): string {
  if (!isoDate) return "";

  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;

  return new Intl.DateTimeFormat(locale, {
    ...FORMAT_PRESETS[format],
    ...opts, // override
  }).format(date);
}
