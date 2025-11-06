import type { Metadata } from "next";
import ClientThemeProvider from "@/components/providers/ClientThemeProvider";

export const metadata: Metadata = {
  title: "Postítulos Docentes DPES",
  description: "Sistema de inscripción y gestión de postítulos docentes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ClientThemeProvider>{children}</ClientThemeProvider>
      </body>
    </html>
  );
}
