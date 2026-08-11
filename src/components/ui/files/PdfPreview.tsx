"use client";

import "pdfjs-dist/web/pdf_viewer.css";
import "@/styles/04-components/ui/files/pdf-preview.scss";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import IconButton from "@/components/ui/buttons/IconButton";
import Spinner from "@/components/ui/loaders/Spinner";

import type { PdfPreviewProps } from "@/types/ui/files/pdf-preview";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

/** Factor mínimo de `pdfViewer.currentScale` que corresponde a `zoom={1}` (ver {@link PdfPreviewProps}), fijado tras el primer ajuste "a la ventana". */
type FitScale = number | null;

/**
 * Vista previa de un PDF, usada por {@link FileViewer}: monta el componente
 * `PDFViewer` real de PDF.js (`pdfjs-dist/web/pdf_viewer.mjs`) — el mismo
 * motor que usa Firefox internamente — en vez de un `<canvas>` pintado a
 * mano página a página. Da scroll continuo entre páginas, selección de
 * texto y un zoom más nítido que recalcular manualmente cada `<canvas>`.
 *
 * No se usa el visor de PDF nativo del navegador en un `<iframe>`: ese visor
 * es en sí mismo un documento con sus propios recursos, y Chrome (y
 * navegadores basados en Chromium) lo bloquea al detectar que se está
 * embebiendo desde un origen distinto del que sirve la página que lo
 * contiene — el mensaje que ve el usuario es justo "Chrome ha bloqueado esta
 * página", sin relación con la CSP ni el `sandbox` del `<iframe>` (se probó
 * quitando ambos y el bloqueo persistía).
 *
 * El worker se carga desde `/pdf.worker.min.mjs` (`public/`, copiado por
 * `scripts/copy-pdf-worker.mjs` en cada instalación) en vez de dejar que el
 * bundler lo procese como módulo: un worker de PDF.js empaquetado pierde las
 * rutas relativas con las que carga sus propios recursos internos.
 * @param {PdfPreviewProps} props - Propiedades de la vista previa
 * @returns {JSX.Element} El documento con scroll continuo, o su estado de carga/error
 */
export default function PdfPreview({ url, name, zoom = 1 }: PdfPreviewProps) {
  const t = useTranslations("Common.FileViewer");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pdfViewerRef = useRef<import("pdfjs-dist/web/pdf_viewer.mjs").PDFViewer | null>(null);
  // Escala de "ajustar a la ventana" (zoom={1}), fijada una sola vez cuando el
  // documento termina de cargar: el zoom que llega por prop es un factor sobre
  // ese ajuste inicial (1 = tal como se abrió, 1.5 = 150% de eso), no un
  // porcentaje absoluto de PDF.js.
  const fitScaleRef = useRef<FitScale>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  // Monta el `PDFViewer` una sola vez por URL: crearlo de nuevo en cada
  // render tiraría el scroll y el documento ya cargado.
  useEffect(() => {
    const container = containerRef.current;
    const viewer = viewerRef.current;
    // v8 ignore next -- defensivo: ambos nodos ya están montados en el primer render.
    if (!container || !viewer) return;

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    fitScaleRef.current = null;

    // `pdf_viewer.mjs` no importa el core de PDF.js como módulo: lee
    // `globalThis.pdfjsLib` (línea `} = globalThis.pdfjsLib;` al inicio del
    // fichero), tal como lo deja un `<script>` clásico en la demo oficial de
    // Mozilla. Sin asignarlo primero, cualquier símbolo que use (`AbortException`,
    // `getDocument`...) revienta con "Cannot destructure property ... of
    // 'globalThis.pdfjsLib' as it is undefined" en cuanto se evalúa el módulo.
    import("pdfjs-dist")
      .then((pdfjs) => {
        if (cancelled) return undefined;

        (globalThis as { pdfjsLib?: typeof pdfjs }).pdfjsLib = pdfjs;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        return import("pdfjs-dist/web/pdf_viewer.mjs").then((pdfjsViewer) => ({
          pdfjs,
          pdfjsViewer,
        }));
      })
      .then((modules) => {
        if (cancelled || !modules) return;
        const { pdfjs, pdfjsViewer } = modules;

        const eventBus = new pdfjsViewer.EventBus();
        const linkService = new pdfjsViewer.PDFLinkService({ eventBus });
        const pdfViewer = new pdfjsViewer.PDFViewer({
          container,
          viewer,
          eventBus,
          linkService,
        });
        linkService.setViewer(pdfViewer);
        pdfViewerRef.current = pdfViewer;

        eventBus.on("pagesloaded", () => {
          if (cancelled) return;
          // "A la ventana" en el primer render; el zoom del usuario se aplica
          // después, en el efecto que reacciona a la prop `zoom`.
          pdfViewer.currentScaleValue = "page-fit";
          fitScaleRef.current = pdfViewer.currentScale;
          setPageCount(pdfViewer.pagesCount);
          setIsLoading(false);
        });

        eventBus.on("pagechanging", (event: { pageNumber: number }) => {
          if (!cancelled) setCurrentPage(event.pageNumber);
        });

        return pdfjs.getDocument({ url }).promise.then((pdfDocument) => {
          if (cancelled) return;
          pdfViewer.setDocument(pdfDocument);
          linkService.setDocument(pdfDocument);
        });
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => {
      cancelled = true;
      pdfViewerRef.current = null;
    };
  }, [url]);

  // Reaplica el zoom del usuario sobre la escala "a la ventana" ya fijada.
  // No se aplica en el mismo efecto que crea el visor: `fitScaleRef` todavía
  // no existe la primera vez que este efecto corre (se fija en `pagesloaded`,
  // asíncrono), así que reacciona por separado a los cambios de `zoom`.
  useEffect(() => {
    const pdfViewer = pdfViewerRef.current;
    const fitScale = fitScaleRef.current;
    if (!pdfViewer || fitScale === null) return;

    pdfViewer.currentScale = fitScale * zoom;
  }, [zoom]);

  const goToPage = (page: number) => {
    const pdfViewer = pdfViewerRef.current;
    // v8 ignore next -- defensivo: los botones que llaman a esto están deshabilitados sin documento cargado.
    if (!pdfViewer) return;

    pdfViewer.currentPageNumber = page;
  };

  if (hasError) {
    return (
      <div className="pdf-preview pdf-preview--message">
        <p>{t("pdfError", { fileName: name })}</p>
      </div>
    );
  }

  return (
    <div className="pdf-preview">
      {isLoading && (
        <div className="pdf-preview__loading">
          <Spinner />
        </div>
      )}

      <div ref={containerRef} className="pdf-preview__container">
        <div ref={viewerRef} className="pdfViewer" />
      </div>

      {!isLoading && pageCount > 1 && (
        <div className="pdf-preview__pager">
          <IconButton
            ariaLabel="previousPage"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>

          <span className="pdf-preview__pager__count">
            {t("pdfPage", { current: currentPage, total: pageCount })}
          </span>

          <IconButton
            ariaLabel="nextPage"
            disabled={currentPage >= pageCount}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
