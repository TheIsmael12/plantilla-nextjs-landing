'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { PaperclipIcon, SendIcon, XIcon } from 'lucide-react';

import {
  createIncidentComment,
  uploadIncidentAttachment,
} from '@/actions/client-portal/community-incidents-actions';
import { useRealtime } from '@/context/RealtimeProvider';
import { useRouter } from '@/i18n/navigation';
import { formatBillingDate } from '@/utils/billingFormatUtils';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import Avatar from '@/components/ui/avatars/Avatar';
import IncidentAttachmentList from '@/components/ui/client-area/IncidentAttachmentList';
import Textarea from '@/components/ui/inputs/Textarea';

import type { IncidentCommentResponse } from '@/types/client-portal/community';

const MAX_FILES_PER_MESSAGE = 5;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

interface IncidentConversationProps {
  incidentId: string;
  locale: string;
  comments: IncidentCommentResponse[];
}

/**
 * Hilo de una incidencia del portal: mensajes con avatar (propios a la
 * derecha, firmados como "Tú"; los de soporte con el nombre que ya resuelve
 * el backend, "Soporte Nombre Ape") y composer con adjuntos.
 *
 * Los mensajes nuevos aparecen al instante vía `onIncidentComment` (el mismo
 * evento de socket que ya usa la intranet), sin esperar a un
 * `router.refresh()`, salvo cuando el propio mensaje lleva adjuntos (el
 * evento se emite antes de que terminen de subirse) o no hay conexión de
 * tiempo real, casos en los que sí se refresca la ruta.
 * @param {IncidentConversationProps} props - Incidencia, locale y comentarios ya resueltos en servidor
 * @returns {JSX.Element} El hilo renderizado
 */
export default function IncidentConversation({
  incidentId,
  locale,
  comments: serverComments,
}: IncidentConversationProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tCommon = useTranslations('Views.ClientArea.Common');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const realtime = useRealtime();

  const [comments, setComments] = useState(serverComments);
  const [lastSyncedComments, setLastSyncedComments] = useState(serverComments);

  // Mismo patrón usado en la intranet: resincroniza en el propio render (no
  // en un efecto) cuando la lista del servidor cambia de verdad, sin depender
  // de `ref.current` durante el render (prohibido por el compilador de React
  // de este proyecto).
  if (lastSyncedComments !== serverComments) {
    setLastSyncedComments(serverComments);
    setComments(serverComments);
  }

  useEffect(() => {
    return realtime.onIncidentComment((comment) => {
      if (comment.incidentId !== incidentId) return;

      setComments((current) =>
        current.some((existing) => existing.id === comment.id) ? current : [...current, comment],
      );
    });
  }, [realtime, incidentId]);

  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, startSubmit] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';

    const accepted = picked.filter((file) => file.size <= MAX_FILE_SIZE_BYTES);

    setFiles((previous) => [...previous, ...accepted].slice(0, MAX_FILES_PER_MESSAGE));
  };

  const removeFile = (index: number) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    startSubmit(async () => {
      const response = await createIncidentComment(incidentId, { body: trimmed });
      notifyResponse(response, tErrors('unexpectedError'));

      if (isErrorStatus(response.status) || !response.data) return;

      const commentId = response.data.id;
      const hadFiles = files.length > 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('commentId', commentId);

        const upload = await uploadIncidentAttachment(incidentId, formData);
        if (isErrorStatus(upload.status)) notifyResponse(upload, tErrors('unexpectedError'));
      }

      setBody('');
      setFiles([]);

      // El propio emisor recibe su comentario por `onIncidentComment`, igual que cualquier otra
      // pestaña; solo hace falta refrescar si hubo adjuntos (el evento se emite sin ellos, antes de
      // que terminen de subirse) o si no hay conexión de tiempo real.
      if (hadFiles || !realtime.isConnected) router.refresh();
    });
  };

  return (
    <section className="incident-detail__block">
      <h2 className="incident-detail__block-title">{t('threadTitle')}</h2>

      {comments.length === 0 ? (
        <p className="incident-detail__text">{t('threadEmpty')}</p>
      ) : (
        <ul className="incident-detail__thread">
          {comments.map((comment) => {
            const isMine = comment.authorName === null || comment.authorName === undefined;
            const author = isMine ? t('threadYou') : (comment.authorName ?? t('threadYou'));

            return (
              <li
                key={comment.id}
                className={`incident-detail__thread-item${
                  isMine ? ' incident-detail__thread-item--mine' : ''
                }`}
              >
                <Avatar name={author} size="sm" />

                <div className="incident-detail__thread-bubble">
                  <div className="incident-detail__thread-meta">
                    <span className="incident-detail__thread-author">{author}</span>
                    <span className="incident-detail__thread-date">
                      {formatBillingDate(comment.createdAt, locale, tCommon('notAvailable'))}
                    </span>
                  </div>

                  <p className="incident-detail__text">{comment.body}</p>

                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="incident-detail__thread-files">
                      <IncidentAttachmentList
                        incidentId={incidentId}
                        attachments={comment.attachments}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="incident-detail__composer">
        <div className="incident-detail__composer__field">
          {files.length > 0 && (
            <div className="incident-detail__composer-files">
              {files.map((file, index) => (
                <span key={`${file.name}-${index}`} className="incident-detail__composer-file">
                  {file.name}
                  <button type="button" onClick={() => removeFile(index)} aria-label="remove">
                    <XIcon size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Textarea
            id="incident-comment-body"
            name="body"
            noTranslate
            placeholder={t('commentPlaceholder')}
            rows={3}
            maxLength={5000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>

        <div className="incident-detail__composer__actions">
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={handlePick}
          />
          <button
            type="button"
            className="incident-detail__composer-attach"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= MAX_FILES_PER_MESSAGE}
            aria-label="attach"
          >
            <PaperclipIcon aria-hidden="true" />
          </button>

          <button
            type="button"
            className="incident-detail__composer-send"
            onClick={handleSubmit}
            disabled={isSubmitting || !body.trim()}
            aria-label="send"
          >
            <SendIcon aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
