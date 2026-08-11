"use client";

import "@/styles/04-components/ui/files/file-item.scss";

import { useTranslations } from "next-intl";

import {
  formatFileSize,
  getFileExtension,
  isCsvFile,
  isImageFile,
  isPdfFile,
} from "@/utils/fileUtils";

import BackendImage from "@/components/ui/images/BackendImage";
import IconButton from "@/components/ui/buttons/IconButton";

import type { FileItemProps } from "@/types/ui/files/file-item";

import {
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  XIcon,
} from "lucide-react";

/**
 * Fila de un fichero adjunto: vista previa a la izquierda (miniatura si es una
 * imagen, icono propio si es un PDF o un CSV, o la extensión en mayúsculas para
 * el resto), nombre y tamaño en el centro, y las acciones que haya habilitado
 * el llamador a la derecha. La vista previa solo es pulsable cuando se pasa `onView`, que es
 * como {@link FileList} distingue los ficheros que el visor sabe representar
 * de los que únicamente se pueden descargar.
 * @param {FileItemProps} props - Propiedades de la fila
 * @returns {JSX.Element} La fila del fichero renderizada
 */
export default function FileItem({
  name,
  sizeBytes,
  src,
  mimeType,
  onView,
  onRemove,
  onDownload,
  disabled = false,
  className,
}: FileItemProps) {
  const t = useTranslations("Common.FileUpload");

  const isImage = isImageFile(mimeType);
  const isPdf = isPdfFile(mimeType);
  const isCsv = isCsvFile(mimeType, name);
  const previewKind = isImage ? "image" : isPdf ? "pdf" : isCsv ? "csv" : "file";

  const preview = (
    <>
      {isImage && (
        <BackendImage src={src} alt={name} fallback={<FileIcon aria-hidden="true" />} />
      )}

      {isPdf && (
        <>
          <FileTextIcon aria-hidden="true" />
          <span className="file-item__preview__label">PDF</span>
        </>
      )}

      {isCsv && (
        <>
          <FileSpreadsheetIcon aria-hidden="true" />
          <span className="file-item__preview__label">CSV</span>
        </>
      )}

      {!isImage && !isPdf && !isCsv && (
        <>
          <FileIcon aria-hidden="true" />
          <span className="file-item__preview__label">{getFileExtension(name)}</span>
        </>
      )}

      {onView && (
        <span className="file-item__preview__overlay" aria-hidden="true">
          <EyeIcon />
        </span>
      )}
    </>
  );

  return (
    <div className={`file-item${className ? ` ${className}` : ""}`}>
      {onView ? (
        <button
          type="button"
          className={`file-item__preview file-item__preview--${previewKind}`}
          onClick={onView}
          title={t("view", { fileName: name })}
          aria-label={t("view", { fileName: name })}
        >
          {preview}
        </button>
      ) : (
        <span className={`file-item__preview file-item__preview--${previewKind}`}>
          {preview}
        </span>
      )}

      <div className="file-item__info">
        <span className="file-item__name" title={name}>
          {name}
        </span>
        <span className="file-item__size">{formatFileSize(sizeBytes)}</span>
      </div>

      <div className="file-item__actions">
        {onDownload && (
          <IconButton ariaLabel="download" disabled={disabled} onClick={onDownload}>
            <DownloadIcon />
          </IconButton>
        )}

        {onRemove && (
          <IconButton
            ariaLabel="removeFile"
            variant="error"
            disabled={disabled}
            onClick={onRemove}
          >
            <XIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}
