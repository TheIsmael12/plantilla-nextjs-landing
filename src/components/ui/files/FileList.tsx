"use client";

import "@/styles/04-components/ui/files/file-list.scss";

import { useState } from "react";

import { logAsyncFailure } from "@/utils/asyncUtils";
import { downloadFileFromUrl, isViewableFile } from "@/utils/fileUtils";

import FileItem from "@/components/ui/files/FileItem";
import FileViewer from "@/components/ui/files/FileViewer";

import type { FileAttachment, FileListProps } from "@/types/ui/files/file-list";
import type { ViewableFile } from "@/types/ui/files/file-viewer";

/**
 * Lista de ficheros adjuntos: un {@link FileItem} por fichero y un único
 * {@link FileViewer} compartido, que se abre por el fichero pulsado. Sirve
 * igual para adjuntos ya guardados en el backend que para una selección local
 * en curso ({@link FileUpload}), porque ambos llegan con la misma forma
 * ({@link FileAttachment}).
 *
 * Al visor solo se le pasan los ficheros previsualizables, así que navegar
 * con las flechas nunca cae en un fichero que no se puede pintar; por eso el
 * índice inicial se traduce de la posición en la lista a la posición dentro de
 * ese subconjunto.
 *
 * La fila y el visor pueden usar **imágenes distintas**: con
 * `resolveThumbnailUrl` la fila pinta una miniatura ligera y el visor sigue
 * abriendo el original. Es lo que permite que una ficha con seis fotos no se
 * traiga seis imágenes completas para pintar seis cuadraditos. Sin ese prop
 * las dos usan `resolveUrl`, que es el comportamiento de siempre.
 * @param {FileListProps} props - Propiedades de la lista
 * @returns {JSX.Element | null} La lista renderizada, o `null` si no hay ficheros
 */
export default function FileList({
  files,
  onRemove,
  canRemove,
  onDownload,
  onView,
  disabled = false,
  resolveUrl = (src) => src,
  resolveThumbnailUrl,
  className,
}: FileListProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Sin miniatura propia, la fila usa la misma URL que el visor: es el comportamiento de siempre.
  const thumbnailUrl = resolveThumbnailUrl ?? resolveUrl;

  const viewableFiles: ViewableFile[] = files
    .filter((file) => isViewableFile(file.mimeType, file.name))
    .map((file) => ({
      id: file.id,
      url: resolveUrl(file.src),
      name: file.name,
      mimeType: file.mimeType,
    }));

  const handleView = (index: number) => {
    // Posición del fichero pulsado dentro de los previsualizables, que es lo
    // que entiende el visor: cuántos previsualizables hay antes que él.
    const indexInViewer = files
      .slice(0, index)
      .filter((file) => isViewableFile(file.mimeType, file.name)).length;

    /*
     * Se avisa **antes** de abrir para que quien nos usa pueda traerse el
     * original si solo tenía la miniatura. El visor se abre igual: mientras
     * llega, pinta lo que haya, y la imagen se sustituye al resolverse.
     */
    const picked = files[index];
    if (picked) onView?.(picked, index);

    setViewerIndex(indexInViewer);
  };

  const handleDownload = (file: FileAttachment, index: number) => {
    if (onDownload) {
      onDownload(file, index);
      return;
    }

    downloadFileFromUrl(resolveUrl(file.src), file.name)
      .catch(logAsyncFailure("FileList"));
  };

  if (files.length === 0) return null;

  return (
    <>
      <div className={`file-list${className ? ` ${className}` : ""}`}>
        {files.map((file, index) => {
          const isViewable = isViewableFile(file.mimeType, file.name);
          const isRemovable = Boolean(onRemove) && (canRemove?.(file, index) ?? true);

          return (
            <FileItem
              key={file.id}
              name={file.name}
              sizeBytes={file.sizeBytes}
              src={thumbnailUrl(file.src)}
              mimeType={file.mimeType}
              disabled={disabled}
              onView={isViewable ? () => handleView(index) : undefined}
              onDownload={isViewable ? undefined : () => handleDownload(file, index)}
              onRemove={isRemovable ? () => onRemove?.(file, index) : undefined}
            />
          );
        })}
      </div>

      <FileViewer
        isOpen={viewerIndex !== null}
        files={viewableFiles}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}
