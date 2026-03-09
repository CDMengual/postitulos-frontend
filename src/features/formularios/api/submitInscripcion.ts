import { AxiosError } from "axios";
import api from "@/shared/api/client";

interface UploadSignData {
  path: string;
  signedUrl?: string;
  uploadUrl?: string;
  url?: string;
}

interface UploadSignResponse {
  success: boolean;
  message: string;
  data: UploadSignData;
}

export interface DuplicateInscripcionErrorData {
  success?: boolean;
  message?: string;
  error?: {
    details?: {
      appCode?: string;
      field?: string;
      cohorteId?: number;
    };
  };
}

const normalizeKey = (key: string) => key.trim().toLowerCase();

const getUploadType = (fieldKey: string) => {
  const normalized = normalizeKey(fieldKey);
  if (normalized.includes("dni")) return "dni";
  if (normalized.includes("titulo")) return "titulo";
  return "adjunto";
};

const resolveUploadUrl = (data: UploadSignData) => {
  const rawUrl = data.uploadUrl || data.signedUrl || data.url;
  if (!rawUrl) return null;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;

  const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseBaseUrl) return null;
  return `${supabaseBaseUrl}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
};

export interface SubmitInscripcionInput {
  cohorteId: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string | null;
  celular: string | null;
  datosFormulario: Record<string, string | string[] | number | boolean | null>;
  fileEntries: Array<[string, File]>;
}

export class SubmitInscripcionError extends Error {
  status?: number;
  appCode?: string;

  constructor(message: string, options?: { status?: number; appCode?: string }) {
    super(message);
    this.status = options?.status;
    this.appCode = options?.appCode;
  }
}

export async function submitInscripcion({
  cohorteId,
  dni,
  nombre,
  apellido,
  email,
  celular,
  datosFormulario,
  fileEntries,
}: SubmitInscripcionInput) {
  try {
    let dniAdjuntoPath: string | null = null;
    let tituloAdjuntoPath: string | null = null;

    for (const [key, file] of fileEntries) {
      const tipo = getUploadType(key);
      const signRes = await api.post<UploadSignResponse>(
        `/public/cohortes/${cohorteId}/uploads/sign`,
        {
          dni,
          tipo,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        }
      );

      const signData = signRes.data?.data;
      const uploadUrl = resolveUploadUrl(signData);
      const path = signData?.path;

      if (!uploadUrl || !path) {
        throw new SubmitInscripcionError("No se pudo obtener firma de subida");
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new SubmitInscripcionError("No se pudo subir uno de los archivos");
      }

      datosFormulario[key] = path;

      if (tipo === "dni") dniAdjuntoPath = path;
      if (tipo === "titulo") tituloAdjuntoPath = path;
    }

    await api.post(`/public/cohortes/${cohorteId}/inscripciones`, {
      cohorteId,
      nombre,
      apellido,
      dni,
      email,
      celular,
      datosFormulario,
      dniAdjuntoPath,
      tituloAdjuntoPath,
    });
  } catch (err) {
    if (err instanceof SubmitInscripcionError) {
      throw err;
    }

    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const data = err.response?.data as DuplicateInscripcionErrorData | undefined;
      const appCode = data?.error?.details?.appCode;
      const message = data?.message ?? "No se pudo enviar la inscripcion";
      throw new SubmitInscripcionError(message, { status, appCode });
    }

    throw new SubmitInscripcionError("No se pudo enviar la inscripcion");
  }
}
