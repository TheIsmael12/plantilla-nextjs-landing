"use client";

import "@/styles/04-components/ui/files/file-viewer.scss";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "next-intl";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  downloadFileFromUrl,
  isCsvFile,
  isImageFile,
  isPdfFile,
  isSafeFileUrl,
} from "@/utils/fileUtils";
import { logAsyncFailure } from "@/utils/asyncUtils";

import Button from "@/components/ui/buttons/Button";
import IconButton from "@/components/ui/buttons/IconButton";
import CsvPreview from "@/components/ui/files/CsvPreview";
import PdfPreview from "@/components/ui/files/PdfPreview";
import ZoomableImage from "@/components/ui/files/ZoomableImage";

import type { FileViewerProps } from "@/types/ui/files/file-viewer";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  RotateCcwIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";

/** Paso de cada pulsación de zoom, y sus límites: de 0.5x a 3x, empezando en el ajuste "a la ventana". */
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1;

/**
 * Visor de adjuntos a pantalla completa: imágenes y PDFs, con navegación
 * entre los ficheros de la misma colección (flechas del teclado o botones) y
 * descarga del que se está viendo. Lo abre {@link FileList} al pulsar sobre
 * una vista previa, pero puede usarse suelto.
 *
 * No se apoya en {@link ModalComponent} porque no comparte nada con él más
 * allá del portal: aquí no hay título, ni formulario, ni pie de acciones — el
 * contenido ocupa la pantalla y los controles flotan encima. Sí reutiliza sus
 * dos hooks (`useFocusTrap` para `Escape` y el foco, `useOutsideClick` para
 * cerrar pulsando fuera y bloquear el scroll del fondo).
 * @param {FileViewerProps} props - Propiedades del visor
 * @returns {JSX.Element | null} El visor (vía `createPortal`), o `null` si está cerrado o no hay ficheros
 */
export default function FileViewer({
  isOpen,
  files,
  initialIndex = 0,
  onClose,
  onDownload,
}: FileViewerProps) {
  const t = useTranslations("Common.FileViewer");

  const contentRef = useRef<HTMLDivElement | null>(null);
  const fileContainerRef = useRef<HTMLDivElement | null>(null);
  // Posición del ratón y scroll del contenedor al iniciar un arrastre: se lee
  // en cada `mousemove` para calcular cuánto desplazar, en vez de acumular
  // deltas (que arrastraría el redondeo de cada evento).
  const dragStateRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(
    null,
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  // `ZoomableImage` necesita el nodo real (no solo la ref) para poder
  // observar su tamaño con `ResizeObserver`: un `useRef` no dispara render al
  // asignarse, así que sin este estado seguiría viendo `null` incluso después
  // de montado.
  const [fileContainerElement, setFileContainerElement] = useState<HTMLDivElement | null>(null);

  // Resincroniza el fichero mostrado cuando el llamador abre el visor por
  // otro distinto, ajustando el estado durante el render (mismo patrón que
  // `useFilters`) en vez de con un efecto, que pintaría primero el anterior.
  const [lastInitialIndex, setLastInitialIndex] = useState(initialIndex);
  if (initialIndex !== lastInitialIndex) {
    setLastInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setZoom(DEFAULT_ZOOM);
  }

  useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: onClose,
    ref: contentRef,
  });

  useOutsideClick(contentRef, {
    onOutsideClick: onClose,
    isActive: isOpen,
    lockScroll: true,
  });

  // El índice puede quedar fuera de rango si la colección encoge mientras el
  // visor está abierto (p. ej. se elimina el último adjunto).
  const safeIndex = Math.min(currentIndex, Math.max(files.length - 1, 0));
  const currentFile = files[safeIndex];
  const hasSeveral = files.length > 1;
  const isImage = Boolean(currentFile && isImageFile(currentFile.mimeType));
  // El CSV ya es una tabla con su propio scroll, y "no previsualizable" no
  // tiene nada que ampliar: el zoom solo tiene sentido en PDF e imagen.
  const isZoomable = Boolean(currentFile && (isPdfFile(currentFile.mimeType) || isImage));
  // Arrastrar para desplazar solo en imagen: `PdfPreview` ya tiene su propia
  // capa de texto seleccionable con el ratón (PDF.js), y el drag-to-pan
  // competiría con esa selección en vez de complementarla.
  const canDragToPan = isImage && zoom > DEFAULT_ZOOM;

  useEffect(() => {
    if (!isOpen || !hasSeveral) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => (index > 0 ? index - 1 : files.length - 1));
        setZoom(DEFAULT_ZOOM);
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => (index < files.length - 1 ? index + 1 : 0));
        setZoom(DEFAULT_ZOOM);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasSeveral, files.length]);

  // El arrastre se sigue a nivel de documento (no solo dentro del
  // contenedor): el ratón puede salir de esa zona en pleno arrastre sin
  // soltar el botón, y perder el listener ahí dejaría el pan "enganchado".
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = fileContainerRef.current;
      const drag = dragStateRef.current;
      if (!container || !drag) return;

      container.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
      container.scrollTop = drag.scrollTop - (event.clientY - drag.startY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStateRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || !currentFile) return null;

  const handlePrevious = () => {
    setCurrentIndex((index) => (index > 0 ? index - 1 : files.length - 1));
    setZoom(DEFAULT_ZOOM);
  };

  const handleNext = () => {
    setCurrentIndex((index) => (index < files.length - 1 ? index + 1 : 0));
    setZoom(DEFAULT_ZOOM);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => setZoom(DEFAULT_ZOOM);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(currentFile);
      return;
    }

    downloadFileFromUrl(currentFile.url, currentFile.name)
      .catch(logAsyncFailure("FileViewer"));
  };

  const handleDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canDragToPan) return;
    const container = fileContainerRef.current;
    if (!container) return;

    // Botón izquierdo solamente: sin esto, un clic derecho (menú contextual
    // del navegador) o central también arrancaría el arrastre.
    if (event.button !== 0) return;

    event.preventDefault();
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
    setIsDragging(true);
  };

  const renderFile = () => {
    // Un fichero cuya URL no es de un esquema seguro no se pinta: `javascript:`
    // en un `src`/`href` ejecutaría código en el origen de la aplicación.
    if (!isSafeFileUrl(currentFile.url)) {
      return (
        <div className="file-viewer__unsupported">
          <FileIcon aria-hidden="true" />
          <p>{t("unsupported", { fileName: currentFile.name })}</p>
        </div>
      );
    }

    if (isPdfFile(currentFile.mimeType)) {
      // Renderizado con PDF.js sobre un `<canvas>` propio (`PdfPreview`), no
      // con el visor de PDF nativo del navegador en un `<iframe>`: ese visor
      // es en sí un documento con sus propios recursos, y Chrome lo bloquea
      // al detectar que se embebe desde un origen distinto del que sirve esta
      // página — sin relación con la CSP ni el `sandbox` del `<iframe>` (se
      // probó quitando ambos y el bloqueo persistía). El zoom se le pasa como
      // factor para recalcular la resolución del `<canvas>`, no como
      // `transform` CSS: así la página se repinta nítida a cada nivel en vez
      // de estirarse pixelada.
      return <PdfPreview url={currentFile.url} name={currentFile.name} zoom={zoom} />;
    }

    if (isImageFile(currentFile.mimeType)) {
      // `width`/`height` reales, no `transform: scale()`: el zoom por
      // transform es puramente visual y no agranda el `scrollWidth`/
      // `scrollHeight` del contenedor, así que el arrastre no tendría nada
      // que desplazar por mucho zoom que se aplicara.
      return (
        <ZoomableImage
          src={currentFile.url}
          alt={currentFile.name}
          zoom={zoom}
          containerElement={fileContainerElement}
        />
      );
    }

    if (isCsvFile(currentFile.mimeType, currentFile.name)) {
      return <CsvPreview url={currentFile.url} name={currentFile.name} />;
    }

    return (
      <div className="file-viewer__unsupported">
        <FileIcon aria-hidden="true" />
        <p>{t("unsupported", { fileName: currentFile.name })}</p>
        <Button variant="primary" title="download" onClick={handleDownload}>
          <DownloadIcon />
        </Button>
      </div>
    );
  };

  return createPortal(
    <div className="file-viewer" role="dialog" aria-modal="true" aria-label={t("title")}>
      <div className="file-viewer__overlay" />

      <div ref={contentRef} className="file-viewer__content">
        <div className="file-viewer__toolbar">
          {isZoomable && (
            <>
              <IconButton
                ariaLabel="zoomOut"
                disabled={zoom <= MIN_ZOOM}
                onClick={handleZoomOut}
              >
                <ZoomOutIcon />
              </IconButton>

              <span className="file-viewer__zoom-level">{Math.round(zoom * 100)}%</span>

              <IconButton
                ariaLabel="zoomIn"
                disabled={zoom >= MAX_ZOOM}
                onClick={handleZoomIn}
              >
                <ZoomInIcon />
              </IconButton>

              <IconButton
                ariaLabel="resetZoom"
                disabled={zoom === DEFAULT_ZOOM}
                onClick={handleZoomReset}
              >
                <RotateCcwIcon />
              </IconButton>
            </>
          )}

          <IconButton ariaLabel="download" onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>

          <IconButton ariaLabel="close" variant="error" onClick={onClose}>
            <XIcon />
          </IconButton>
        </div>

        {hasSeveral && (
          <IconButton
            ariaLabel="previousFile"
            className="file-viewer__nav file-viewer__nav--prev"
            onClick={handlePrevious}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        <div
          ref={(node) => {
            fileContainerRef.current = node;
            setFileContainerElement(node);
          }}
          className={`file-viewer__file-container${
            canDragToPan ? ` file-viewer__file-container--draggable${isDragging ? " file-viewer__file-container--dragging" : ""}` : ""
          }`}
          onMouseDown={handleDragStart}
          // `ZoomableImage` ya marca su `<img>` como `draggable={false}`,
          // pero esto cubre cualquier otro contenido futuro de este
          // contenedor: el drag nativo del navegador competiría con el pan
          // por scroll de `handleDragStart`.
          onDragStart={(event) => canDragToPan && event.preventDefault()}
        >
          {renderFile()}
        </div>

        {hasSeveral && (
          <IconButton
            ariaLabel="nextFile"
            className="file-viewer__nav file-viewer__nav--next"
            onClick={handleNext}
          >
            <ChevronRightIcon />
          </IconButton>
        )}

        <footer className="file-viewer__footer">
          <span className="file-viewer__filename">{currentFile.name}</span>

          {hasSeveral && (
            <span className="file-viewer__counter">
              {t("counter", { current: safeIndex + 1, total: files.length })}
            </span>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
