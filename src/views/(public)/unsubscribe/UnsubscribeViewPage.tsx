'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { unsubscribeLead } from '@/actions/leads/leads-actions';
import { isErrorStatus } from '@/utils/httpStatusUtils';

import Alert from '@/components/ui/alerts/Alert';
import Button from '@/components/ui/buttons/Button';
import Card from '@/components/ui/cards/Card';

import '@/styles/04-components/unsubscribe/unsubscribe.scss';

interface UnsubscribeViewPageProps {
  token?: string;
}

/**
 * Página pública de baja de comunicaciones comerciales (`POST
 * /public/leads/unsubscribe`, art. 7.3 RGPD).
 *
 * Pide **una confirmación** en vez de ejecutar la baja al abrir el enlace, a
 * pesar de que la ley solo exige que sea fácil: los clientes de correo
 * prefetchean los enlaces de los mensajes, y una baja que se ejecuta con un
 * `GET`/carga de página se dispararía sola sin que nadie la haya pedido. Un
 * clic más es un precio pequeño por no dar de baja a quien no quería.
 *
 * Sin token no se explica qué falta ni se ofrece reintentar: un enlace
 * inválido es indistinguible de uno caducado o manipulado, y detallarlo solo
 * ayudaría a adivinar tokens.
 * @param {UnsubscribeViewPageProps} props - Propiedades de la vista
 * @returns {JSX.Element} La página de baja renderizada
 */
export default function UnsubscribeViewPage({ token }: UnsubscribeViewPageProps) {
  const t = useTranslations('Unsubscribe');

  const [result, setResult] = useState<'done' | 'error' | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!token) return;

    startTransition(async () => {
      const response = await unsubscribeLead(token);
      setResult(isErrorStatus(response.status) ? 'error' : 'done');
    });
  };

  return (
    <main className="unsubscribe">
      <div className="unsubscribe__container">
        <Card className="unsubscribe__card">
          <h1 className="unsubscribe__title">{t('title')}</h1>

          {!token && <Alert type="danger" message={t('invalidToken')} />}

          {token && result === null && (
            <>
              <p className="unsubscribe__description">{t('description')}</p>

              <div className="unsubscribe__actions">
                <Button
                  variant="primary"
                  title={isPending ? 'loading' : 'confirm'}
                  onClick={handleConfirm}
                  disabled={isPending}
                />
              </div>
            </>
          )}

          {result === 'done' && <Alert type="success" message={t('done')} />}
          {result === 'error' && <Alert type="danger" message={t('invalidToken')} />}
        </Card>
      </div>
    </main>
  );
}
