"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getInscripcion,
  getSignedInscripcionDocumentoUrl,
  updateInscripcionDocumentacion,
  updateInscripcionEstado,
  updateInscripcionObservaciones,
} from "@/features/inscripciones/api";
import {
  DocumentacionInscripcion,
  EstadoInscripcionPrivada,
  InscripcionDetalle,
} from "@/features/inscripciones/model/types";
import { appToast } from "@/shared/lib/toast";

export function useInscripcionDetail(id?: number) {
  const [inscripcion, setInscripcion] = useState<InscripcionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingDocumentacion, setSavingDocumentacion] = useState(false);
  const [savingObservaciones, setSavingObservaciones] = useState(false);
  const [openingDniDoc, setOpeningDniDoc] = useState(false);
  const [openingTituloDoc, setOpeningTituloDoc] = useState(false);
  const [observacionesDraft, setObservacionesDraft] = useState("");

  const refresh = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;

    setLoading(true);
    try {
      const nextInscripcion = await getInscripcion(id);
      setInscripcion(nextInscripcion);
    } catch {
      appToast.error("No se pudo cargar la inscripcion");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setObservacionesDraft(inscripcion?.observaciones ?? "");
  }, [inscripcion?.observaciones]);

  const datosFormularioEntries = useMemo(
    () => Object.entries(inscripcion?.datosFormulario ?? {}),
    [inscripcion?.datosFormulario]
  );

  const changeEstado = useCallback(
    async (newEstado: EstadoInscripcionPrivada) => {
      if (!inscripcion || newEstado === inscripcion.estado) return;

      const previousEstado = inscripcion.estado;
      setInscripcion((prev) => (prev ? { ...prev, estado: newEstado } : prev));
      setSavingEstado(true);

      try {
        await updateInscripcionEstado(inscripcion.id, newEstado);
      } catch {
        setInscripcion((prev) => (prev ? { ...prev, estado: previousEstado } : prev));
        appToast.error("No se pudo actualizar el estado");
      } finally {
        setSavingEstado(false);
      }
    },
    [inscripcion]
  );

  const changeDocumentacion = useCallback(
    async (newDocumentacion: DocumentacionInscripcion) => {
      if (!inscripcion || newDocumentacion === inscripcion.documentacion) return;

      const previousDocumentacion = inscripcion.documentacion;
      setInscripcion((prev) => (prev ? { ...prev, documentacion: newDocumentacion } : prev));
      setSavingDocumentacion(true);

      try {
        await updateInscripcionDocumentacion(inscripcion.id, newDocumentacion);
      } catch {
        setInscripcion((prev) =>
          prev ? { ...prev, documentacion: previousDocumentacion } : prev
        );
        appToast.error("No se pudo actualizar la documentacion");
      } finally {
        setSavingDocumentacion(false);
      }
    },
    [inscripcion]
  );

  const openDocumento = useCallback(
    async (tipo: "dni" | "titulo") => {
      if (!inscripcion) return;

      const setLoadingState = tipo === "dni" ? setOpeningDniDoc : setOpeningTituloDoc;
      setLoadingState(true);

      try {
        const documentData = await getSignedInscripcionDocumentoUrl(inscripcion.id, tipo);
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
    [inscripcion]
  );

  const saveObservaciones = useCallback(async () => {
    if (!inscripcion) return false;

    const previousObservaciones = inscripcion.observaciones ?? "";
    if (observacionesDraft === previousObservaciones) return true;

    setSavingObservaciones(true);
    try {
      await updateInscripcionObservaciones(inscripcion.id, observacionesDraft);
      setInscripcion((prev) => (prev ? { ...prev, observaciones: observacionesDraft } : prev));
      appToast.success("Observaciones guardadas");
      return true;
    } catch {
      appToast.error("No se pudieron guardar las observaciones");
      return false;
    } finally {
      setSavingObservaciones(false);
    }
  }, [inscripcion, observacionesDraft]);

  return {
    inscripcion,
    loading,
    savingEstado,
    savingDocumentacion,
    savingObservaciones,
    openingDniDoc,
    openingTituloDoc,
    observacionesDraft,
    datosFormularioEntries,
    setObservacionesDraft,
    refresh,
    changeEstado,
    changeDocumentacion,
    openDocumento,
    saveObservaciones,
  };
}
