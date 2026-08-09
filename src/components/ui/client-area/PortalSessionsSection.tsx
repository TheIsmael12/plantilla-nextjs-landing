'use client';

import { useState, useTransition } from 'react';

import { useTranslations } from 'next-intl';
import { LogOutIcon, MonitorIcon } from 'lucide-react';

import { revokeAllOtherSessions, revokeSession } from '@/actions/client-portal/sessions-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import type { PortalSession } from '@/types/client-portal/sessions';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import SessionCard from '@/components/ui/cards/SessionCard';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import '@/styles/04-components/client-area/portal-sessions.scss';

interface PortalSessionsSectionProps {
  initialSessions: PortalSession[];
}

/**
 * Sección de sesiones abiertas del portal: lista las sesiones vía
 * `SessionCard`, con cierre individual (`DELETE client/me/sessions/{id}`) y un
 * botón para cerrar todas las demás de golpe (`DELETE client/me/sessions`),
 * este último tras confirmación. El estado local se actualiza con la respuesta
 * de cada acción en vez de recargar la página.
 * @param {PortalSessionsSectionProps} props - Sesiones abiertas al cargar la página
 * @returns {JSX.Element} La sección de sesiones renderizada
 */
export default function PortalSessionsSection({ initialSessions }: PortalSessionsSectionProps) {
  const t = useTranslations('Views.ClientArea.Profile.Sessions');
  const tErrors = useTranslations('Common.Errors');

  const [sessions, setSessions] = useState(initialSessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokeAllConfirmOpen, setIsRevokeAllConfirmOpen] = useState(false);
  const [isRevokingSingle, startRevokeSingle] = useTransition();
  const [isRevokingAll, startRevokeAll] = useTransition();

  const isSuccess = (status: number) =>
    status === HTTPStatus.OK || status === HTTPStatus.NO_CONTENT;

  const handleRevoke = (id: string) => {
    setRevokingId(id);
    startRevokeSingle(async () => {
      const response = await revokeSession(id);
      notifyResponse(response, tErrors('unexpectedError'));
      if (isSuccess(response.status)) {
        setSessions((prev) => prev.filter((session) => session.id !== id));
      }
      setRevokingId(null);
    });
  };

  const handleRevokeAllConfirm = () => {
    setIsRevokeAllConfirmOpen(false);
    startRevokeAll(async () => {
      const response = await revokeAllOtherSessions();
      notifyResponse(response, tErrors('unexpectedError'));
      if (isSuccess(response.status)) {
        setSessions((prev) => prev.filter((session) => session.isCurrent));
      }
    });
  };

  return (
    <>
      <SettingsSection
        title={t('title')}
        description={t('description')}
        icon={MonitorIcon}
        actions={
          sessions.length > 1 && (
            <Button
              title={isRevokingAll ? 'revoking' : 'revokeOthers'}
              variant="outline"
              onClick={() => setIsRevokeAllConfirmOpen(true)}
              disabled={isRevokingAll || isRevokingSingle}
            >
              <LogOutIcon />
            </Button>
          )
        }
      >
        {sessions.length === 0 ? (
          <p className="portal-sessions-section__empty">{t('empty')}</p>
        ) : (
          <div className="portal-sessions-section__list">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={() => handleRevoke(session.id)}
                isRevoking={isRevokingSingle && revokingId === session.id}
              />
            ))}
          </div>
        )}
      </SettingsSection>

      {isRevokeAllConfirmOpen && (
        <ModalComponent
          title={t('confirmRevokeAllTitle')}
          isOpen
          onClose={() => setIsRevokeAllConfirmOpen(false)}
          onCancel={() => setIsRevokeAllConfirmOpen(false)}
          onConfirm={handleRevokeAllConfirm}
          confirmVariant="error"
          confirmText="revokeOthers"
        >
          <p>{t('confirmRevokeAllDescription')}</p>
        </ModalComponent>
      )}
    </>
  );
}
