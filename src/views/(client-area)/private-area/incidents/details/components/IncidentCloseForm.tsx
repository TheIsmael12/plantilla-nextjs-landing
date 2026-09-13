'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { StarIcon } from 'lucide-react';

import { closeIncident } from '@/actions/client-portal/community-incidents-actions';
import { useRouter } from '@/i18n/navigation';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import ModalComponent from '@/components/ui/modals/ModalComponent';
import Textarea from '@/components/ui/inputs/Textarea';

const COMMENT_MAX = 2000;

interface IncidentCloseFormProps {
  incidentId: string;
  onClose: () => void;
}

/**
 * Modal de confirmación: cierra la incidencia `RESOLVED` y la valora de 1 a 5 estrellas.
 *
 * Se abre desde `IncidentsDetailsViewPage` (mientras está `RESOLVED`) o desde `IncidentStatusMenu`
 * (para darla por resuelta sin esperar al staff): es la respuesta afirmativa del cliente a «lo hemos
 * arreglado», simétrica a la que ya existe en la app del vecino (`IncidentResolutionActions`, un
 * `Sheet` real). Antes se pintaba inline en la página en vez de como modal: sin overlay ni foco
 * atrapado, y en dos puntos del árbol a la vez si el cliente entraba por el menú de tres puntos con la
 * incidencia además en `RESOLVED`. Como modal único, `onClose` lo puede cerrar quien lo abre sin volver
 * a montarlo, y sea cual sea la vía es literalmente el mismo diálogo en pantalla.
 *
 * La valoración es obligatoria y el comentario no: «ya está» no necesita explicación, y pedirla
 * convertiría una confirmación de un toque en un formulario que la mitad abandona.
 * @param {IncidentCloseFormProps} props - La incidencia a cerrar y el cierre del modal
 * @returns {JSX.Element} El modal de cierre
 */
export default function IncidentCloseForm({ incidentId, onClose }: IncidentCloseFormProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tErrors = useTranslations('Common.Errors');
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, startSubmit] = useTransition();
  const [validationError, setValidationError] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      setValidationError(true);
      return;
    }

    setValidationError(false);

    startSubmit(async () => {
      const response = await closeIncident(incidentId, {
        rating,
        comment: comment.trim() || undefined,
      });

      notifyResponse(response, tErrors('unexpectedError'));

      if (isErrorStatus(response.status)) return;

      onClose();
      router.refresh();
    });
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <ModalComponent
      title={t('closeTitle')}
      isOpen
      onClose={onClose}
      closeOnOutsideClick={!isSubmitting}
      onCancel={onClose}
      onConfirm={handleSubmit}
      isLoading={isSubmitting}
      confirmText="confirmCloseIncident"
    >
      <p className="incident-detail__text">{t('closeDescription')}</p>

      <div
        role="radiogroup"
        aria-label={t('ratingLabel')}
        className="incident-detail__rating"
      >
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rating}
            aria-label={`${star}`}
            className={`incident-detail__rating-star${
              star <= rating ? ' incident-detail__rating-star--filled' : ''
            }`}
            onClick={() => {
              setRating(star);
              setValidationError(false);
            }}
          >
            <StarIcon
              aria-hidden="true"
              fill={star <= rating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>

      {validationError && (
        <p className="incident-detail__rating-error">{t('ratingRequired')}</p>
      )}

      <Textarea
        id="incident-close-comment"
        name="comment"
        noTranslate
        label={t('closeCommentLabel')}
        placeholder={t('closeCommentPlaceholder')}
        rows={2}
        maxLength={COMMENT_MAX}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        disabled={isSubmitting}
      />
    </ModalComponent>
  );
}
