'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { StarIcon } from 'lucide-react';

import { closeIncident } from '@/actions/client-portal/community-incidents-actions';
import { useRouter } from '@/i18n/navigation';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Textarea from '@/components/ui/inputs/Textarea';

const COMMENT_MAX = 2000;

interface IncidentCloseFormProps {
  incidentId: string;
}

/**
 * Confirma una incidencia resuelta, la cierra y la valora de 1 a 5 estrellas.
 *
 * Solo se pinta cuando la incidencia está `RESUELTA` (lo decide `IncidentsDetailsViewPage`, que es
 * quien conoce el estado): es la respuesta afirmativa del cliente a «lo hemos arreglado», simétrica a
 * la que ya existe en la app del vecino (`IncidentResolutionActions`). Una vez cerrada, esta pantalla
 * deja de mostrarse — `IncidentsDetailsViewPage` pinta la valoración ya dada en su lugar.
 *
 * La valoración es obligatoria y el comentario no: «ya está» no necesita explicación, y pedirla
 * convertiría una confirmación de un toque en un formulario que la mitad abandona.
 * @param {IncidentCloseFormProps} props - La incidencia a cerrar
 * @returns {JSX.Element} El formulario de cierre
 */
export default function IncidentCloseForm({ incidentId }: IncidentCloseFormProps) {
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

      router.refresh();
    });
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <section className="incident-detail__block">
      <h2 className="incident-detail__block-title">{t('closeTitle')}</h2>
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
      />

      <Button
        variant="primary"
        title="confirmCloseIncident"
        onClick={handleSubmit}
        disabled={isSubmitting}
      />
    </section>
  );
}
