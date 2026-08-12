'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckIcon, XIcon } from 'lucide-react';

import { acceptClientQuote, rejectClientQuote } from '@/actions/client-portal/quotes-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import ModalComponent from '@/components/ui/modals/ModalComponent';

import '@/styles/04-components/client-area/client-detail.scss';

interface QuoteDecisionActionsProps {
  quoteId: string;
}

/**
 * Botones de aceptar/rechazar de `/private-area/quotes/[id]`, la única parte
 * interactiva del detalle. Ambas decisiones piden confirmación: rechazar es
 * irreversible, y aceptar genera automáticamente el contrato del servicio
 * asociado. Tras una decisión correcta se refresca la ruta para que el Server
 * Component vuelva a pintar el nuevo estado (y esconda estos botones, que
 * solo se montan mientras el presupuesto está en `SENT`).
 * @param {QuoteDecisionActionsProps} props - Propiedades del componente
 * @returns {JSX.Element} Los botones de decisión y sus modales de confirmación
 */
export default function QuoteActions({ quoteId }: QuoteDecisionActionsProps) {
  const t = useTranslations('Views.ClientArea.Quotes.Detail');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runDecision = (decision: () => Promise<{ status: number; message?: string }>) => {
    startTransition(async () => {
      const response = await decision();
      notifyResponse(response, tErrors('unexpectedError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
        router.refresh();
      }
    });
  };

  const handleAccept = () => {
    setIsAcceptOpen(false);
    runDecision(() => acceptClientQuote(quoteId));
  };

  const handleReject = () => {
    setIsRejectOpen(false);
    runDecision(() => rejectClientQuote(quoteId));
  };

  return (
    <>
      <div className="client-detail__quote-actions">
        <Button
          title={isPending ? 'accepting' : 'accept'}
          variant="primary"
          onClick={() => setIsAcceptOpen(true)}
          disabled={isPending}
        >
          {!isPending && <CheckIcon />}
        </Button>

        <Button
          title={isPending ? 'rejecting' : 'reject'}
          variant="outline"
          onClick={() => setIsRejectOpen(true)}
          disabled={isPending}
        >
          {!isPending && <XIcon />}
        </Button>
      </div>

      {isAcceptOpen && (
        <ModalComponent
          title={t('acceptTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setIsAcceptOpen(false)}
          onCancel={() => setIsAcceptOpen(false)}
          onConfirm={handleAccept}
          confirmVariant="primary"
          confirmText="accept"
        >
          <p>{t('acceptDescription')}</p>
        </ModalComponent>
      )}

      {isRejectOpen && (
        <ModalComponent
          title={t('rejectTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setIsRejectOpen(false)}
          onCancel={() => setIsRejectOpen(false)}
          onConfirm={handleReject}
          confirmVariant="danger"
          confirmText="reject"
        >
          <p>{t('rejectDescription')}</p>
        </ModalComponent>
      )}
    </>
  );
}
