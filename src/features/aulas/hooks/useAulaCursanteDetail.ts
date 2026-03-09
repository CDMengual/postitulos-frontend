"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAulaCursanteDetail,
  getSignedAulaCursanteDocumentoUrl,
  updateAulaCursanteDocumentacion,
  updateAulaCursanteEstado,
  updateAulaCursanteObservaciones,
} from "@/features/aulas/api";
import { AulaCursanteDetail } from "@/features/aulas/model/types";
import { DocumentacionCursante, EstadoCursante } from "@/features/cursantes/model/types";
import { appToast } from "@/shared/lib/toast";

export function useAulaCursanteDetail(aulaId: number, cursanteId: number) {
  const [detail, setDetail] = useState<AulaCursanteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingObservaciones, setSavingObservaciones] = useState(false);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingDocumentacion, setSavingDocumentacion] = useState(false);
  const [openingDniDoc, setOpeningDniDoc] = useState(false);
  const [openingTituloDoc, setOpeningTituloDoc] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState("");

  const refresh = useCallback(async () => {
    if (Number.isNaN(aulaId) || Number.isNaN(cursanteId)) return;

    try {
      setLoading(true);
      const nextDetail = await getAulaCursanteDetail(aulaId, cursanteId);
      setDetail(nextDetail);
      setObservacionesDraft(nextDetail.inscripcionAula.observaciones ?? "");
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404) {
        appToast.error("El cursante no pertenece a esta aula");
      } else {
        appToast.error("No se pudo cargar el detalle del cursante");
      }
    } finally {
      setLoading(false);
    }
  }, [aulaId, cursanteId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const changeEstado = useCallback(
    async (newEstado: EstadoCursante) => {
      if (!detail) return;

      const previousEstado = detail.inscripcionAula.estado;
      if (newEstado === previousEstado) return;

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: { ...prev.inscripcionAula, estado: newEstado },
            }
          : prev
      );
      setSavingEstado(true);

      try {
        await updateAulaCursanteEstado(aulaId, cursanteId, newEstado);
      } catch {
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                inscripcionAula: { ...prev.inscripcionAula, estado: previousEstado },
              }
            : prev
        );
        appToast.error("No se pudo actualizar el estado");
      } finally {
        setSavingEstado(false);
      }
    },
    [aulaId, cursanteId, detail]
  );

  const changeDocumentacion = useCallback(
    async (newDocumentacion: DocumentacionCursante) => {
      if (!detail) return;

      const previousDocumentacion = detail.inscripcionAula.documentacion;
      if (newDocumentacion === previousDocumentacion) return;

      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: { ...prev.inscripcionAula, documentacion: newDocumentacion },
            }
          : prev
      );
      setSavingDocumentacion(true);

      try {
        await updateAulaCursanteDocumentacion(aulaId, cursanteId, newDocumentacion);
      } catch {
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                inscripcionAula: {
                  ...prev.inscripcionAula,
                  documentacion: previousDocumentacion,
                },
              }
            : prev
        );
        appToast.error("No se pudo actualizar la documentacion");
      } finally {
        setSavingDocumentacion(false);
      }
    },
    [aulaId, cursanteId, detail]
  );

  const saveObservaciones = useCallback(async () => {
    if (!detail) return;

    const previousObservaciones = detail.inscripcionAula.observaciones ?? "";
    if (observacionesDraft === previousObservaciones) return;

    setSavingObservaciones(true);
    try {
      const payload = await updateAulaCursanteObservaciones(aulaId, cursanteId, observacionesDraft);
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              inscripcionAula: {
                ...prev.inscripcionAula,
                ...payload,
              },
            }
          : prev
      );
      setObservacionesDraft(payload.observaciones ?? "");
      appToast.success("Observaciones guardadas");
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404) {
        appToast.error("El cursante no pertenece a esta aula");
      } else {
        appToast.error("No se pudieron guardar las observaciones");
      }
    } finally {
      setSavingObservaciones(false);
    }
  }, [aulaId, cursanteId, detail, observacionesDraft]);

  const openDocumento = useCallback(
    async (tipo: "dni" | "titulo") => {
      const setLoadingState = tipo === "dni" ? setOpeningDniDoc : setOpeningTituloDoc;
      setLoadingState(true);

      try {
        const documentData = await getSignedAulaCursanteDocumentoUrl(aulaId, cursanteId, tipo);
        if (!documentData.signedUrl) {
          appToast.error("No se pudo obtener la URL del documento");
          return;
        }

        window.open(documentData.signedUrl, "_blank", "noopener,noreferrer");
      } catch {
        appToast.error("No se pudo abrir el documento");
      } finally {
        setLoadingState(false);
      }
    },
    [aulaId, cursanteId]
  );

  const estadoValue = useMemo(() => detail?.inscripcionAula.estado, [detail?.inscripcionAula.estado]);
  const documentacionValue = useMemo(
    () => detail?.inscripcionAula.documentacion,
    [detail?.inscripcionAula.documentacion]
  );

  return {
    detail,
    loading,
    savingObservaciones,
    savingEstado,
    savingDocumentacion,
    openingDniDoc,
    openingTituloDoc,
    observacionesDraft,
    setObservacionesDraft,
    refresh,
    changeEstado,
    changeDocumentacion,
    saveObservaciones,
    openDocumento,
    estadoValue,
    documentacionValue,
  };
}
