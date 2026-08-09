'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { DownloadIcon, PaperclipIcon } from 'lucide-react';

import { downloadIncidentAttachment } from '@/actions/client-portal/community-incidents-actions';
import { downloadBase64File } from '@/utils/fileDownloadUtils';
import { formatFileSize } from '@/utils/fileSizeUtils';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import type { IncidentAttachment } from '@/types/client-portal/community';

interface IncidentAttachmentListProps {
  incidentId: string;
  attachments: IncidentAttachment[];
}

/**
 * Adjuntos de una incidencia o de un mensaje del hilo, solo descarga.
 *
 * A diferencia de la intranet, aquí no hay visor de imágenes ni miniaturas
 * (nada de lo que sube el cliente se reescala) ni borrado (el cliente no
 * puede eliminar adjuntos, ni los suyos ni los de soporte). Cada fichero no
 * tiene URL pública — igual que en intranet, puede ser la foto de una
 * reclamación — así que se trae en base64 por una Server Action que vuelve a
 * comprobar propiedad y visibilidad en cada descarga.
 * @param {IncidentAttachmentListProps} props - Propiedades del componente
 * @returns {JSX.Element | null} La lista de adjuntos renderizada, o `null` si no hay ninguno
 */
export default function IncidentAttachmentList({
  incidentId,
  attachments,
}: IncidentAttachmentListProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tErrors = useTranslations('Common.Errors');

  const [isDownloading, startDownload] = useTransition();

  if (attachments.length === 0) return null;

  const handleDownload = (attachment: IncidentAttachment) => {
    startDownload(async () => {
      const response = await downloadIncidentAttachment(incidentId, attachment.id);

      if (isErrorStatus(response.status) || !response.data) {
        notifyResponse(response, tErrors('unexpectedError'));
        return;
      }

      downloadBase64File(response.data.base64, attachment.filename, response.data.mimeType);
    });
  };

  return (
    <ul className="incident-detail__attachment-list">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <button
            type="button"
            className="incident-detail__attachment"
            onClick={() => handleDownload(attachment)}
            disabled={isDownloading}
          >
            <PaperclipIcon aria-hidden="true" />
            <span className="incident-detail__attachment-name">{attachment.filename}</span>
            <span className="incident-detail__attachment-size">
              {formatFileSize(attachment.sizeBytes)}
            </span>
            <DownloadIcon aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
