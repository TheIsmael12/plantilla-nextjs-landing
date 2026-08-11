'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { downloadIncidentAttachment } from '@/actions/client-portal/community-incidents-actions';
import { downloadBase64File } from '@/utils/fileDownloadUtils';
import { isViewableFile } from '@/utils/fileUtils';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import FileList from '@/components/ui/files/FileList';
import Skeleton from '@/components/ui/loaders/Skeleton';

import type { IncidentAttachment } from '@/types/client-portal/community';
import type { FileAttachment } from '@/types/ui/files/file-list';

interface IncidentAttachmentListProps {
  incidentId: string;
  attachments: IncidentAttachment[];
}

/**
 * Adjuntos de una incidencia o de un mensaje del hilo, con miniatura, visor y descarga.
 *
 * El detalle que lo condiciona todo: **estos ficheros no tienen URL**. No se sirven públicamente porque un
 * adjunto puede ser la foto de una reclamación, así que cada uno se trae por el endpoint autenticado —que
 * vuelve a comprobar propiedad y visibilidad— y llega en base64 por una Server Action.
 *
 * Como el visor y las miniaturas del sistema de diseño trabajan con URLs, aquí se convierte cada fichero
 * previsualizable en un `blob:` local y se le pasa a `FileList` por `resolveUrl`. Se hace **al montar** y no al
 * pulsar: es lo que hace falta para que la miniatura se vea y para que las flechas del visor no caigan en un
 * hueco vacío. El coste es real —se descargan los previsualizables aunque nadie los abra— y es asumible
 * porque son como mucho diez por incidencia, y los de un mensaje suelen ser uno o dos. Lo que no se puede
 * previsualizar (un .docx, un .xlsx) no se descarga: solo ofrece su botón de descarga.
 *
 * De las fotos que llegan de la app del vecino se pide **la miniatura** y no el original: cinco fotos de un
 * portal son un megabyte y medio de JPEG para pintar cinco cuadraditos. El original se trae al abrir el visor,
 * y mientras llega el visor amplía la miniatura — borrosa es mejor que vacía.
 *
 * Antes esta lista solo descargaba: para ver la foto de una gotera había que bajarla al disco y abrirla con
 * otro programa. Es el mismo visor que usa la intranet, así que quien mira la incidencia desde el portal ve
 * exactamente lo que ve quien la atiende.
 *
 * **No hay borrado**, ni de los adjuntos propios ni de los de soporte: la lista es el rastro de lo que se
 * aportó, y el cliente no puede reescribirlo. Las URLs `blob:` se liberan al desmontar, que son memoria del
 * navegador que no se recoge sola.
 * @param {IncidentAttachmentListProps} props - Incidencia y sus adjuntos
 * @returns {JSX.Element | null} La lista de adjuntos renderizada, o `null` si no hay ninguno
 */
export default function IncidentAttachmentList({
  incidentId,
  attachments,
}: IncidentAttachmentListProps) {
  const tErrors = useTranslations('Common.Errors');

  const created = useRef<string[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isWorking, startWork] = useTransition();

  /*
   * La clave del efecto son los ids y no el array: el padre reconstruye `attachments` en cada render, y
   * depender del array volvería a descargarlo todo cada vez. Se distingue lo que tiene miniatura de lo que
   * no, porque de lo primero se pide la miniatura y de lo segundo el fichero entero.
   */
  const viewableIds = attachments
    .filter((attachment) => isViewableFile(attachment.mimetype, attachment.filename))
    .map((attachment) => `${attachment.id}:${attachment.hasThumbnail ? 't' : 'o'}`)
    .join(',');

  /**
   * Trae un adjunto y lo convierte en una URL `blob:` local.
   * @param {string} attachmentId - Adjunto a traer
   * @param {"original"|"thumbnail"} variant - Cuál de las dos versiones
   * @returns {Promise<string|null>} La URL, o `null` si la descarga ha fallado
   */
  const toBlobUrl = async (
    attachmentId: string,
    variant: 'original' | 'thumbnail',
  ): Promise<string | null> => {
    const response = await downloadIncidentAttachment(incidentId, attachmentId, variant);

    if (isErrorStatus(response.status) || !response.data) return null;

    const binary = atob(response.data.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const url = URL.createObjectURL(new Blob([bytes], { type: response.data.mimeType }));
    created.current.push(url);

    return url;
  };

  useEffect(() => {
    if (!viewableIds) return;

    let cancelled = false;

    void (async () => {
      const originals: Record<string, string> = {};
      const minis: Record<string, string> = {};

      for (const entry of viewableIds.split(',')) {
        const [id, kind] = entry.split(':');
        if (!id) continue;

        const url = await toBlobUrl(id, kind === 't' ? 'thumbnail' : 'original');
        if (!url) continue;

        if (kind === 't') minis[id] = url;
        else originals[id] = url;
      }

      if (cancelled) return;

      setUrls(originals);
      setThumbnails(minis);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se depende de `viewableIds` (los ids serializados) y no de `attachments`, que es un array nuevo en cada render del padre.
  }, [viewableIds, incidentId]);

  // Las `blob:` se liberan al desmontar: son memoria del navegador que no se recoge sola.
  useEffect(
    () => () => {
      for (const url of created.current) URL.revokeObjectURL(url);
      created.current = [];
    },
    [],
  );

  /**
   * Trae el original de una foto la primera vez que se abre el visor.
   *
   * Sin esto, el visor de una foto de la app enseñaría la miniatura ampliada: se ve, pero borrosa, y esa foto
   * es justo la prueba de lo que hay que arreglar.
   * @param {FileAttachment} file - Fichero que se va a abrir
   */
  const handleView = (file: FileAttachment) => {
    if (urls[file.id]) return;

    void toBlobUrl(file.id, 'original').then((url) => {
      if (url) setUrls((previous) => ({ ...previous, [file.id]: url }));
    });
  };

  const handleDownload = (file: FileAttachment) => {
    const attachment = attachments.find((entry) => entry.id === file.id);
    if (!attachment) return;

    startWork(async () => {
      const response = await downloadIncidentAttachment(incidentId, attachment.id);

      if (isErrorStatus(response.status) || !response.data) {
        notifyResponse(response, tErrors('unexpectedError'));
        return;
      }

      downloadBase64File(response.data.base64, attachment.filename, response.data.mimeType);
    });
  };

  if (attachments.length === 0) return null;

  /*
   * Mientras se resuelven las URLs se pinta un hueco, no la lista.
   *
   * La alternativa era pintarla ya con `src` vacío, y eso deja al navegador pidiendo una imagen que no
   * existe: una miniatura rota y un error en consola por cada fichero.
   */
  const isResolving =
    Boolean(viewableIds) && Object.keys(urls).length === 0 && Object.keys(thumbnails).length === 0;

  if (isResolving) return <Skeleton variant="rectangular" height="4rem" />;

  // `src` lleva el id y no una URL: `resolveUrl` lo cambia por el `blob:` ya resuelto.
  const files: FileAttachment[] = attachments.map((attachment) => ({
    id: attachment.id,
    name: attachment.filename,
    sizeBytes: attachment.sizeBytes,
    src: attachment.id,
    mimeType: attachment.mimetype,
  }));

  return (
    <FileList
      files={files}
      // Mientras el original no ha llegado, el visor pinta la miniatura: borrosa es mejor que vacía.
      resolveUrl={(src) => urls[src] ?? thumbnails[src] ?? ''}
      resolveThumbnailUrl={(src) => thumbnails[src] ?? urls[src] ?? ''}
      onDownload={handleDownload}
      onView={handleView}
      disabled={isWorking}
    />
  );
}
